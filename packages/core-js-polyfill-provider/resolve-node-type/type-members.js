// Type-member resolution. dispatches member access against any TS / Flow type-position node:
//   - `findTypeMember({objectType, key, scope, depth})` - extract a member's annotation node
//     by key; covers interface bodies + class merging + tuple indexing + index signatures +
//     conditional / mapped / structure-preserving wrappers + alias chain
//   - `getTypeMembers({objectType, scope, depth, visited})` - flat list of structural members
//     for a given type node (used by callers iterating all members; rest of the cluster +
//     callers like `discriminant-narrow` / `call-resolution`)
//
// Most surface is cluster-private (recursive cascade between findTypeMember <->
// getTypeMembers, the interface / class collectors, condition / indexed-access helpers).
// External callers see only `findTypeMember`, `getTypeMembers`, `findParentClassDecl`,
// `resolveIndexedAccessMembers`, `pickIndexSignature` - the last three power factory branches
// outside the dispatch (the class-extends walker, indexed-access dispatcher, index-signature
// pick from `resolveIndexSignatureMember`).
import { canonicalArrayIndex, KEY_FILTERING_WRAPPERS, MAX_DEPTH, STRUCTURE_PRESERVING_WRAPPERS } from './base.js';
import {
  interfaceBodyMembers,
  isInterfaceDeclaration,
  isTypeAlias,
  isUnionType,
  synthInterfaceExtendsRef,
  typeAliasBody,
  typeRefName,
  typeRefSegments,
} from './ast-shapes.js';
import { getSuperTypeArgs, getTypeArgs } from '../helpers/ast-patterns.js';

export function createTypeMembers({
  memoize,
  unwrapTypeAnnotation,
  peelTSParenthesized,
  isNullableOrNeverAnnotation,
  isClassLikeDeclaration,
  keyMatchesName,
  getKeyName,
  literalKeyValue,
  indexedAccessKey,
  findAllTypeDeclarations,
  findTypeDeclaration,
  extendsClauseName,
  buildSubstMap,
  buildParentClassSubstFromNodes,
  substMembers,
  applySubst,
  shadowedAliasReturnAnnotation,
  applyAliasSubstDeep,
  applySubstToTypeRefArgs,
  findTupleElement,
  followTypeAliasChain,
  unwrapMappedTypePassthrough,
  expandMappedTypeMembers,
  isUnconstrainedTypeReference,
  pickConditionalBranchVia,
  evaluateConditionalType,
  resolveTypeQueryBinding,
  buildCallSiteSubst,
  resolveTypeAnnotation,
  functionTypeReturnAnnotation,
  unwrapPassthroughWrapper,
  collectInferredNames,
  dropMapKeys,
}) {
  // follow superClass for declared parent members. `Identifier` covers both real and ambient
  // (`declare class P {}` + `class C extends P {}`), which behave the same in type position.
  // member-expression super (`extends NS.Base`) resolves through proxy-global walk OR static-
  // receiver walk to the canonical class name, so non-Identifier super still finds its parent
  function findParentClassDecl(classDecl, scope) {
    const parentName = extendsClauseName(classDecl.superClass ?? classDecl.extends?.[0]?.id, scope);
    if (!parentName) return null;
    const parent = findTypeDeclaration(parentName, scope);
    return isClassLikeDeclaration(parent) ? parent : null;
  }

  // `Cfg['items']` / chained `Cfg['items']['data']` - resolve the indexed access to its
  // annotation, then get members of that. without this, `findTypeMember` on a binding
  // annotated `Cfg['items']` returns null and downstream dispatches to generic polyfill
  function resolveIndexedAccessMembers(node, scope, depth) {
    const key = indexedAccessKey(node.indexType);
    if (key === null) return null;
    const member = findTypeMember({ objectType: node.objectType, key, scope });
    if (member) {
      const annotation = unwrapTypeAnnotation(member.typeAnnotation ?? member);
      return annotation ? getTypeMembers({ objectType: annotation, scope, depth: depth + 1 }) : null;
    }
    // numeric-key tuple fallback: `Parameters<typeof fn>[0].x` - findTypeMember can't see
    // the tuple shape (Parameters is not in STRUCTURE_PRESERVING_WRAPPERS and getTypeMembers
    // returns null for the special built-in), but findTupleElement resolves it via
    // resolveParametersParams. parity with `resolveIndexedAccessType`'s numeric branch
    const numIndex = canonicalArrayIndex(key);
    if (numIndex === null) return null;
    const element = findTupleElement(node.objectType, numIndex, scope);
    return element ? getTypeMembers({ objectType: unwrapTypeAnnotation(element), scope, depth: depth + 1 }) : null;
  }

  // TS allows merged-iface decls with renamed type-params, so each sibling builds its
  // OWN subst against ITS type-param names; outer subst keyed on entry decl silently
  // misses renamed siblings. callers MUST NOT layer an outer subst on top
  function collectInterfaceMembers({ segments, scope, depth, visited, receiverArgs }) {
    const out = [];
    appendMergedInterfaceMembers({ segments, scope, depth, out, receiverArgs, visited: visited ?? new Set() });
    return out.length ? out : null;
  }

  // shorthand for the `buildSubstMap(decl.typeParameters?.params, receiverArgs)` pattern
  // repeated across alias / interface / class collectors. zero-arity decls return null
  // (buildSubstMap guards on declParams length), so siblings without type-params skip
  // substitution cleanly
  function declSubst(decl, receiverArgs, scope) {
    return buildSubstMap(decl.typeParameters?.params, receiverArgs, scope);
  }

  // memoize `(objectType, scope)` -> members. without it every `findTypeMember` re-walks
  // alias-chain + extends + intersection + structure-preserving wrappers for the same
  // objectType (a class with N inherited ifaces re-collects all N per member lookup).
  // visited-walks (cycle-guard interface-merging recursion) bypass: results depend on the
  // caller's seen set, so a no-cycle cached entry could leak through to subsequent walks
  // that need cycle protection
  let getTypeMembersCache = new WeakMap();
  function getTypeMembers(args) {
    if (args.visited) return computeGetTypeMembers(args);
    const { objectType, scope } = args;
    let perObject = getTypeMembersCache.get(objectType);
    if (!perObject) getTypeMembersCache.set(objectType, perObject = new WeakMap());
    return memoize(perObject, scope, () => computeGetTypeMembers(args));
  }

  function computeGetTypeMembers({ objectType, scope, depth = 0, visited = undefined }) {
    if (depth > MAX_DEPTH) return null;
    // leading TSParenthesizedType (`({ ... })['k']`) - passthrough to the inner type's members
    // (oxc preserves the wrapper; babel keeps it in member position)
    if (objectType.type === 'TSParenthesizedType') {
      return getTypeMembers({ objectType: peelTSParenthesized(objectType), scope, depth: depth + 1, visited });
    }
    if (objectType.type === 'TSTypeLiteral') return objectType.members;
    if (objectType.type === 'ObjectTypeAnnotation') return objectType.properties;
    // both TS `T[K]` and Flow `T[K]` (IndexedAccessType) route through the same resolver
    if (objectType.type === 'TSIndexedAccessType' || objectType.type === 'IndexedAccessType') {
      return resolveIndexedAccessMembers(objectType, scope, depth);
    }
    // mapped type: trivial passthrough delegates to the source's members; `as`-rename
    // expands per-key with statically-evaluated rename templates so `r._a` on
    // `{ [K in keyof T as `_${K}`]: T[K] }` resolves through to the source field type
    if (objectType.type === 'TSMappedType') {
      const passthrough = unwrapMappedTypePassthrough(objectType);
      if (passthrough) return getTypeMembers({ objectType: unwrapTypeAnnotation(passthrough), scope, depth: depth + 1, visited });
      return expandMappedTypeMembers({ node: objectType, scope, depth, visited });
    }
    // intersection: collect members from all parts. nested union branches (`A & (B | C)`)
    // expand recursively - without the expansion `getTypeMembers` would receive the bare
    // union node and return null, dropping every member reachable through B or C
    if (objectType.type === 'TSIntersectionType' || objectType.type === 'IntersectionTypeAnnotation') {
      const all = [];
      function pushIntersectionPart(node) {
        let inner = peelTSParenthesized(unwrapTypeAnnotation(node));
        // a parenthesized `(A | B)` or alias-to-union (`type U = A | B; ... & U`) constituent must be
        // distributed per-branch: unwrapTypeAnnotation leaves the parens / alias in place, so the union
        // would slip whole into getTypeMembers (which has no union branch, returns null) and drop every
        // member reachable through a branch
        if (!isUnionType(inner)) {
          const { node: aliased } = followTypeAliasChain(inner, scope);
          const aliasedInner = aliased && peelTSParenthesized(unwrapTypeAnnotation(aliased));
          if (aliasedInner && isUnionType(aliasedInner)) inner = aliasedInner;
        }
        if (isUnionType(inner)) {
          for (const branch of inner.types) pushIntersectionPart(branch);
          return;
        }
        const members = getTypeMembers({ objectType: inner, scope, depth: depth + 1, visited });
        if (members) for (const m of members) all.push(m);
      }
      for (const part of objectType.types) pushIntersectionPart(part);
      return all.length ? all : null;
    }
    // handle dotted refs (`NS.Data`) by passing the segment path through
    const segments = typeRefSegments(objectType);
    if (!segments) return null;
    // structure-preserving wrappers: `Readonly<{...}>.x` / `Pick<T, 'a'>.x` look up on T.
    // Pick / Omit narrow the member set when their second arg is statically-evaluable
    // (literal / literal-union); otherwise passthrough as over-emit (per spec section 6 accepted)
    if (segments.length === 1 && STRUCTURE_PRESERVING_WRAPPERS.has(segments[0])) {
      return resolveStructureWrapperMembers({ wrapperName: segments[0], objectType, scope, depth, visited });
    }
    // `Record<K, V>` - every member access returns V. emit a synthetic index signature so
    // findTypeMember's TSIndexSignature fallback picks it up for any key
    if (segments.length === 1 && segments[0] === 'Record') {
      const params = getTypeArgs(objectType)?.params;
      if (params?.[1]) return [{
        type: 'TSIndexSignature',
        // carry a `parameters` slot (the Record key type, defaulting to string) so
        // resolveIndexedAccessType's `T[string]` discriminator
        // (`parameters[0].typeAnnotation.typeAnnotation === TSStringKeyword`) matches it
        parameters: [{
          type: 'Identifier',
          typeAnnotation: { type: 'TSTypeAnnotation', typeAnnotation: params[0] ?? { type: 'TSStringKeyword' } },
        }],
        typeAnnotation: { type: 'TSTypeAnnotation', typeAnnotation: params[1] },
      }];
    }
    // `InstanceType<typeof Cls>.x` / `ReturnType<typeof fn>.x` -> members of the pointed-to decl
    if (segments.length === 1 && (segments[0] === 'InstanceType' || segments[0] === 'ReturnType')) {
      const arg = getTypeArgs(objectType)?.params[0];
      if (!arg) return null;
      // `ReturnType<Fn>.x` where `Fn = () => T` (alias to function type, no typeof) -
      // follow the alias chain, extract return annotation, fold accumulated subst.
      // mirrors `resolveNamedType`'s ReturnType branch. `InstanceType<>` always needs
      // a class binding so the typeof-only path stays
      if (segments[0] === 'ReturnType' && arg.type !== 'TSTypeQuery') {
        // extract + shadow the signature-local `<T>` + fold the alias subst (shared with the `ReturnType`
        // case in type-annotation-resolve), then enumerate the resolved return's members
        const target = shadowedAliasReturnAnnotation(arg, scope);
        return target ? getTypeMembers({ objectType: unwrapTypeAnnotation(target), scope, depth: depth + 1, visited }) : null;
      }
      if (arg.type !== 'TSTypeQuery') return null;
      const resolved = resolveTypeQueryBinding(arg, scope);
      if (!resolved?.node) return null;
      const target = unwrapTypeAnnotation(segments[0] === 'InstanceType'
        ? resolved.node.id && { type: 'TSTypeReference', typeName: resolved.node.id }
        : resolved.node.returnType ?? resolved.node.typeAnnotation);
      if (!target) return null;
      // `typeof fn<Args>` instantiation expression: type-args ride on the inner TSTypeQuery.
      // fold them into the resolved target so a generic `returnType: InstanceType<T>` sees
      // the concrete `typeof Cls` (otherwise raw T fails the typeof-only gate on the
      // recursive InstanceType branch). InstanceType's synthesized class reference has no
      // type-param to substitute - subst is a no-op there
      const subst = buildCallSiteSubst(resolved.node, arg, scope);
      return getTypeMembers({ objectType: applySubst(target, subst), scope, depth: depth + 1, visited });
    }
    // fast path first; only re-walk for the rare interface-merging case
    const declaration = findTypeDeclaration(segments, scope);
    if (!declaration) return null;
    // class / interface decls: collectors substitute receiver's type-args per-source
    // (each sibling / parent-extends hop builds its own subst against ITS type-param names).
    // members come back already substituted - callers MUST NOT layer an outer subst on top
    const receiverArgs = getTypeArgs(objectType)?.params;
    if (isInterfaceDeclaration(declaration)) {
      return collectInterfaceMembers({ segments, scope, depth, visited, receiverArgs });
    }
    if (isClassLikeDeclaration(declaration)) {
      return collectClassLikeMembers({ declaration, segments, scope, depth, receiverArgs });
    }
    if (isTypeAlias(declaration)) {
      // substitute the alias's type params into member annotations so
      // `type Dict<V> = { [k: string]: V }` + `Dict<number[]>[string]` resolves V to number[]
      return substMembers(
        getTypeMembers({ objectType: unwrapTypeAnnotation(typeAliasBody(declaration)), scope, depth: depth + 1, visited }),
        declSubst(declaration, receiverArgs, scope),
      );
    }
    return null;
  }

  // shared between the interface-only dispatch and the class-as-type collector below, so a
  // class and its merged interface siblings reuse the same walk. cycle guard `visited` is
  // shared with `getTypeMembers`'s interface dispatch so cross-dispatcher recursion observes
  // the same Set. members are pushed already substituted - callers MUST NOT layer an outer
  // subst on top
  function appendMergedInterfaceMembers({ segments, scope, depth, out, receiverArgs, visited }) {
    if (!segments) return;
    const seen = visited ?? new Set();
    for (const iface of findAllTypeDeclarations(segments, scope)) {
      if (!isInterfaceDeclaration(iface) || seen.has(iface)) continue;
      seen.add(iface);
      const ifaceSubst = declSubst(iface, receiverArgs, scope);
      out.push(...substMembers(interfaceBodyMembers(iface), ifaceSubst));
      appendInterfaceExtendsMembers({ iface, scope, depth, out, ifaceSubst, visited: seen });
    }
  }

  function collectClassLikeMembers({ declaration, segments, scope, depth, receiverArgs }) {
    // walk superClass chain with per-class subst derivation. on every hop also pull merged
    // sibling interfaces for the current class - inherited iface members must surface on
    // subclasses (TS declaration merging). receiver's iface lookup uses the user-passed
    // `segments` (may be multi-segment `NS.Foo`); parents are matched by their bare id name.
    // parent receiverArgs come from the previous class's `extends Parent<...>` slot
    const merged = [];
    const seen = new Set();
    let cur = declaration;
    let curSubst = declSubst(declaration, receiverArgs, scope);
    let curReceiverArgs = receiverArgs;
    while (cur && !seen.has(cur)) {
      seen.add(cur);
      // regular classes / interfaces carry members on `body.body`; a Flow `declare class`
      // parent (DeclareClass) carries them on `body.properties` (ObjectTypeAnnotation), so an
      // inherited member from such a parent surfaces on the subclass too
      const ownBody = (cur.body?.body ?? cur.body?.properties ?? []).filter(m => !m?.static);
      merged.push(...substMembers(ownBody, curSubst));
      const lookupSegments = cur === declaration ? segments : (cur.id?.name ? [cur.id.name] : null);
      appendMergedInterfaceMembers({ segments: lookupSegments, scope, depth, out: merged, receiverArgs: curReceiverArgs });
      const parent = findParentClassDecl(cur, scope);
      if (!parent) break;
      // raw super-args (`extends Mid<T>`) reference cur's type params; apply curSubst FIRST
      // so the next hop's iface lookup receives concrete args, not raw param refs. example:
      // `Sub extends Mid<string[]>; Mid<T> extends Base<T>; interface Base<U> { items: U[] }`
      // - iteration cur=Mid sets up parent=Base. Without subst, [T] propagates to Base's iface
      // lookup where ifaceSubst {U->T} resolves items to T[]. With subst applied, [string[]]
      // propagates -> {U->string[]} -> items resolves to string[][]
      // Flow `declare class Sub extends Base<...>` (DeclareClass) carries super-type-args on
      // the heritage clause (`extends[0].typeParameters`), not on the declaration's superType*
      // slots that `getSuperTypeArgs` probes; without the fallback the generic subst into
      // inherited members silently drops and the member resolves to null (over-injection)
      const rawSuperArgs = (getSuperTypeArgs(cur) ?? cur.extends?.[0]?.typeParameters)?.params;
      curReceiverArgs = rawSuperArgs ? rawSuperArgs.map(a => applyAliasSubstDeep(a, curSubst)) : null;
      curSubst = buildParentClassSubstFromNodes(cur, parent, curSubst, scope);
      cur = parent;
    }
    return merged.length ? merged : null;
  }

  // walk `interface X extends A, B` parents. each parent's members carry through the
  // parent decl-param subst mapping so `A<T>.m: T` becomes `m: <instantiated>`. `ifaceSubst`
  // (when present) is applied to parentRef's args first, so `extends Base<U>` with
  // iface `U -> string` becomes `Base<string>` before descending - parent subst then
  // sees the substituted slot
  function appendInterfaceExtendsMembers({ iface, scope, depth, out, ifaceSubst, visited }) {
    for (const parent of iface.extends ?? []) {
      // recursive `getTypeMembers` on `expanded` applies parent's decl-param subst once.
      // pushing the result straight into `out` avoids name-collision double-subst from
      // the outer scope (`interface A<T> extends B<T[]>; interface B<T> { b: T }` would
      // resolve `A<string>.b` to `string[][]` if outer T subst ran twice)
      const parentRef = synthInterfaceExtendsRef(parent);
      if (!parentRef) continue;
      const expanded = ifaceSubst ? applySubstToTypeRefArgs(parentRef, ifaceSubst) : parentRef;
      const parentMembers = getTypeMembers({ objectType: expanded, scope, depth: depth + 1, visited });
      if (parentMembers) out.push(...parentMembers);
    }
  }

  // expand `<Wrapper><T, ...>` members. transparent wrappers (`Readonly` / `Partial`)
  // pass through to T's members. `Pick` / `Omit` filter T's members when keys arg is
  // statically-evaluable; non-decidable keys-arg falls back to passthrough (over-emit
  // safer than under-resolve)
  function resolveStructureWrapperMembers({ wrapperName, objectType, scope, depth, visited }) {
    const args = getTypeArgs(objectType)?.params;
    const arg = args?.[0];
    if (!arg) return null;
    const innerMembers = getTypeMembers({ objectType: unwrapTypeAnnotation(arg), scope, depth: depth + 1, visited });
    if (!innerMembers || !KEY_FILTERING_WRAPPERS.has(wrapperName)) return innerMembers;
    const keys = staticKeySet(args[1]);
    if (!keys) return innerMembers;
    const isPick = wrapperName === 'Pick';
    return innerMembers.filter(m => {
      // non-statically-named members (computed dynamic / private) stay - filter only
      // resolves the statically-known intersection
      const name = getKeyName(m.key);
      if (name === null) return true;
      return isPick ? keys.has(name) : !keys.has(name);
    });
  }

  // collect statically-evaluable literal keys from a TSTypeReference's second arg:
  // string / numeric / boolean literal types and unions of literals. returns Set<string>
  // (numeric / boolean values stringified) or null when shape isn't statically decidable
  // (TypeReference, generic typeparam, intersection, etc.). consumed by `Pick`/`Omit`
  // member-filter path; non-decidable shapes fall back to passthrough
  function staticKeySet(node) {
    const inner = node && unwrapTypeAnnotation(node);
    if (!inner) return null;
    if (inner.type === 'TSLiteralType') {
      const v = literalKeyValue(inner.literal);
      return v === null ? null : new Set([String(v)]);
    }
    if (inner.type !== 'TSUnionType') return null;
    const out = new Set();
    for (const branch of inner.types) {
      const mu = unwrapTypeAnnotation(branch);
      if (mu?.type !== 'TSLiteralType') return null;
      const v = literalKeyValue(mu.literal);
      if (v === null) return null;
      out.add(String(v));
    }
    return out;
  }

  // mixed `{[k:number]:A; [k:string]:B}` index signatures resolve per-lookup: a numeric key may
  // fall back to the string signature (numeric keys coerce to string keys), but a non-numeric
  // string key resolves only via the string signature. unwrap the TSTypeAnnotation wrapper THEN
  // peel TSParenthesizedType - oxc preserves `(string)` as TSParenthesizedType, and the
  // discriminator check below compares against bare keyword types
  function pickIndexSignature(members, key) {
    let numberSig = null;
    let stringSig = null;
    for (const member of members) {
      if (member.type !== 'TSIndexSignature' || !member.typeAnnotation) continue;
      const keyType = peelTSParenthesized(unwrapTypeAnnotation(member.parameters?.[0]?.typeAnnotation))?.type;
      if (keyType === 'TSNumberKeyword') numberSig ??= member.typeAnnotation;
      // a symbol index signature is never selectable by a string / number property key; skip it so
      // it cannot be mistaken for the (otherwise permissive) string signature in the final fallback
      else if (keyType === 'TSSymbolKeyword') continue;
      else stringSig ??= member.typeAnnotation;
    }
    const isNumericKey = typeof key === 'number' || /^-?\d+$/.test(String(key));
    // a number-only / symbol-only index type has no member for a non-numeric string key, so
    // returning the number / symbol value type there would be over-emission, not a real member
    return isNumericKey ? (numberSig ?? stringSig) : stringSig;
  }

  // element AST of an array-shaped type (`X[]` / `Array<X>` / `ReadonlyArray<X>`, readonly-peeled)
  // -> X, else null. shared by the infer matcher and the check-element extraction in the thread
  function arrayElementType(node) {
    let n = unwrapTypeAnnotation(node);
    if (n?.type === 'TSTypeOperator' && n.operator === 'readonly') n = n.typeAnnotation;
    if (n?.type === 'TSArrayType') return n.elementType;
    if (n?.type === 'TSTypeReference' && (typeRefName(n) === 'Array' || typeRefName(n) === 'ReadonlyArray')) {
      return getTypeArgs(n)?.params?.[0] ?? null;
    }
    return null;
  }

  // infer name of an array-element-bare-infer extends (`(infer U)[]` / `Array<infer U>` /
  // `ReadonlyArray<infer U>`), else null - the only conditional shape the numeric-index thread in
  // findConditionalTypeMember handles (narrower than the conditional evaluator's container matcher)
  function arrayElementInferName(extendsType) {
    const element = arrayElementType(extendsType);
    if (peelTSParenthesized(unwrapTypeAnnotation(element || null))?.type !== 'TSInferType') return null;
    const names = collectInferredNames(extendsType);
    return names.size === 1 ? [...names][0] : null;
  }

  // pick the firing branch of a TSConditionalType for member lookup, recursing with the
  // ORIGINAL AST trueType/falseType (not the resolved Type Object). branch-pick strategy:
  //   1) AST equality (literal-vs-literal pairs only)
  //   2) structural eval - resolve substituted check + extends to Type Objects, ask
  //      `pickConditionalBranch` for the branch INDEX (true/false/null)
  //   3) infer-pattern fallback (`T extends (infer U)[] ? U : never`) - evaluator returns
  //      a Type Object that findTypeMember can sometimes look up via known-constructor stubs
  //   4) undecidable - fold both branches into a synthetic union for findTypeMember's
  //      union path
  // keeping the BRANCH INDEX (steps 1-2) and recursing with the AST trueType/falseType is
  // crucial: AST-driven member lookup works for TSTypeLiteral / TSArrayType / etc. shapes
  // where Type Object inputs would silently null
  function findConditionalTypeMember({ aliased, subst, key, scope, depth, withSubst }) {
    const checkSubst = withSubst(aliased.checkType);
    const extendSubst = withSubst(aliased.extendsType);
    // alpha-rename guard: trueType / falseType reference `infer X` declarations bound in
    // extendsType. an outer alias typeparam with the SAME name (`type F<T> = T extends
    // Array<infer T> ? T : never`) would leak into the inner `infer T` slot via the outer
    // `withSubst`, replacing the inferred element with the outer typearg. drop infer names
    // from the subst BEFORE walking the branches. checkSubst / extendSubst above use the
    // outer subst intentionally - the branch picker matches the check expression against
    // the constraint, both use outer-scope substitutions
    const innerSubst = dropMapKeys(subst, collectInferredNames(aliased.extendsType));
    function innerWithSubst(node) {
      return node ? applySubst(unwrapTypeAnnotation(node), innerSubst) : node;
    }
    // array element-infer thread, ahead of pickConditionalBranchVia (which returns null for an
    // `infer` extends - undecidable structurally): `T extends Array<infer U> ? <true> : ...` with an
    // array check type fires the TRUE branch, and U = the check's element (AST). thread it so a
    // numeric index into the true branch resolves (`(U[])[0]` -> element) instead of leaving U
    // unresolved (-> null -> ambiguous `.at` over-emit). substituting an AST element keeps the member
    // path AST-only, avoiding the Type-Object boundary an evaluated-conditional return would hit.
    // gated on arrayCheckElement being non-null - i.e. the check IS an array, so it genuinely
    // extends Array<infer U> and the true branch is the firing one
    const inferName = arrayElementInferName(aliased.extendsType);
    const inferElement = inferName ? arrayElementType(checkSubst) : null;
    if (inferElement) {
      const threadedSubst = new Map(innerSubst);
      threadedSubst.set(inferName, inferElement);
      const trueObjectType = applySubst(unwrapTypeAnnotation(aliased.trueType), threadedSubst);
      return findTypeMember({ objectType: trueObjectType, key, scope, depth: depth + 1 });
    }
    // POST-AST-subst path: extendSubst already carries the substitution. pickConditionalBranchVia
    // resolves via resolveTypeAnnotation and reads `isUnconstrained` from the post-subst AST -
    // typeparam refs that resolved to a concrete shape no longer read as unconstrained
    const branch = pickConditionalBranchVia({
      checkAST: checkSubst,
      extendsAST: extendSubst,
      resolveOne: ast => resolveTypeAnnotation(ast, scope, depth + 1),
      isUnconstrained: isUnconstrainedTypeReference(extendSubst),
    });
    if (branch !== null) {
      return findTypeMember({ objectType: innerWithSubst(branch ? aliased.trueType : aliased.falseType), key, scope, depth: depth + 1 });
    }
    // structural-eval may return a Type Object ($Primitive / $Object) that findTypeMember
    // can occasionally lookup via known-constructor stubs (`$Object('Array')`). when the
    // Type Object DOESN'T dispatch (most non-container shapes), don't short-circuit -
    // fall through to per-branch AST fallback below so neither branch's member set is
    // silently dropped
    const resolved = evaluateConditionalType(applySubst(aliased, subst), null, scope, depth + 1, null);
    if (resolved) {
      const direct = findTypeMember({ objectType: resolved, key, scope, depth: depth + 1 });
      if (direct) return direct;
    }
    const trueResult = findTypeMember({ objectType: innerWithSubst(aliased.trueType), key, scope, depth: depth + 1 });
    const falseResult = findTypeMember({ objectType: innerWithSubst(aliased.falseType), key, scope, depth: depth + 1 });
    // strip nullable/never branches symmetric with `resolveConditionalBranches` - otherwise
    // `K extends string ? Foo : never` post-subst can return a synth union carrying the
    // never branch as a member, which would interfere with downstream member dispatch
    const trueViable = trueResult && !isNullableOrNeverAnnotation(trueResult) ? trueResult : null;
    const falseViable = falseResult && !isNullableOrNeverAnnotation(falseResult) ? falseResult : null;
    if (!trueViable) return falseViable;
    if (!falseViable) return trueViable;
    return { type: 'TSUnionType', types: [trueViable, falseViable] };
  }

  // method-member lookups (TSMethodSignature, ClassMethod, TSDeclareMethod, MethodDefinition,
  // ClassPrivateMethod) expose the full signature: folding to `{ type: 'TSFunctionType' }`
  // answers the "this is a function-typed slot" question but loses parameters + return type,
  // breaking `ReturnType<typeof X.method>` / `Parameters<typeof X.method>`.
  // so `functionTypeReturnAnnotation` and friends can read the slots; subst applied deeply
  // so type-ref substitution composes into return type / parameter types. `resolveTypeAnnotation`
  // maps the same node kinds back to `$Object('Function')` for property-access semantics
  function returnMemberMethodNode(member, subst) {
    return subst ? applyAliasSubstDeep(member, subst) : member;
  }

  // numeric-index access on tuple / array shapes. tuple: `[T, U][0]` -> T, `[T][length]` ->
  // number (static arity). array: `T[][i]` -> T regardless of index. non-numeric / out-of-range
  // keys return null so the caller can continue through the generic member walk
  function tryIndexedElementMember({ aliased, key, scope, subst }) {
    if (aliased?.type === 'TSTupleType' || aliased?.type === 'TupleTypeAnnotation') {
      if (key === 'length') return { type: 'TSNumberKeyword' };
      const index = canonicalArrayIndex(key);
      if (index === null) return null;
      const element = findTupleElement(aliased, index, scope);
      return element ? applySubst(element, subst) : null;
    }
    if ((aliased?.type === 'TSArrayType' || aliased?.type === 'ArrayTypeAnnotation')
      && canonicalArrayIndex(key) !== null && aliased.elementType) {
      return applySubst(aliased.elementType, subst);
    }
    return null;
  }

  function findTypeMember({ objectType, key, scope, depth = 0 }) {
    if (!objectType || depth > MAX_DEPTH) return null;
    // peel a leading TSParenthesizedType (`(A | B)['k']`) so the union / intersection / structural
    // dispatch below sees the raw discriminated shape, not the wrapper (branch-level peel is withSubst)
    objectType = peelTSParenthesized(objectType);
    // unions: recurse per branch (with subst applied), fold matches into a synthetic union.
    // union member may itself be a wrapped generic (`Inner<T>` / `T[]`); deep subst
    // descends into the inner type-param
    const { node: aliased, subst } = followTypeAliasChain(objectType, scope);
    // `Readonly<[T, U]>[0]` - after chain-follow the alias may still land on a structure-
    // preserving wrapper. peel it here so the tuple branch below gets the raw TSTupleType
    // (getTypeMembers fallback returns null for tuples - they carry element types, not members)
    // structure-preserving wrapper (`Readonly<T>`) OR trivial mapped-type passthrough
    // (`{ [K in keyof T]: T[K] }`) - both unwrap to T for property-lookup purposes. subst
    // from `followTypeAliasChain` already maps the alias's type-params to the receiver's
    // concrete args; apply to the unwrapped inner before recursing
    // SUBSTITUTE before unwrapping: `Awaited<T>` with subst T -> Promise<X[]> must unwrap the
    // SUBSTITUTED promise layer (peel-then-subst yielded the raw Promise and dropped the
    // member); order-equivalent for the structure-preserving wrappers (`Readonly<T>` etc.)
    const passthrough = unwrapPassthroughWrapper(applySubst(aliased ?? objectType, subst), scope);
    if (passthrough) {
      return findTypeMember({ objectType: passthrough, key, scope, depth: depth + 1 });
    }
    function withSubst(node) {
      if (!node) return node;
      // peel TSParenthesizedType (oxc preserves `(B)` / `(B | C)` as a wrapper; babel keeps it
      // in member position too) so union / intersection branch recursion and member-type
      // returns see the raw discriminated shape instead of bailing on the wrapper
      const unwrapped = peelTSParenthesized(unwrapTypeAnnotation(node));
      return applySubst(unwrapped, subst);
    }
    // conditional types route through dedicated helper: extracts the branch-pick logic
    // (AST equality > structural Type Object eval > infer-pattern fallback > undecidable
    // union fold) into one place. without the extraction, findTypeMember exceeds the
    // max-statements lint threshold and the member-lookup-on-conditional path becomes
    // hard to reason about
    if (aliased?.type === 'TSConditionalType') {
      return findConditionalTypeMember({ aliased, subst, key, scope, depth, withSubst });
    }
    function resolveBranch(member) {
      return findTypeMember({ objectType: withSubst(unwrapTypeAnnotation(member)), key, scope, depth: depth + 1 });
    }
    if (isUnionType(aliased)) {
      const found = aliased.types.map(resolveBranch).filter(Boolean);
      if (!found.length) return null;
      if (found.length === 1) return found[0];
      return { type: aliased.type, types: found };
    }
    // intersection: `(A & B)['k']` is `A['k'] & B['k']` - a key declared in several constituents
    // contributes the INTERSECTION of its per-constituent member types, not the first hit. collect
    // every constituent's member and fold into a synthetic intersection (mirrors the union branch
    // and the additive `getTypeMembers` intersection semantics); the downstream
    // `foldIntersectionTypes` prefers the array / string-like constituent over a bare object, so a
    // non-array member listed before an array member no longer shadows the array polyfill
    if (aliased?.type === 'TSIntersectionType' || aliased?.type === 'IntersectionTypeAnnotation') {
      const found = aliased.types.map(resolveBranch).filter(Boolean);
      if (!found.length) return null;
      if (found.length === 1) return found[0];
      return { type: aliased.type, types: found };
    }
    const indexedElement = tryIndexedElementMember({ aliased, key, scope, subst });
    if (indexedElement) return indexedElement;
    // walk through trivial mapped passthroughs / aliases when looking up members
    const members = getTypeMembers({ objectType: aliased ?? objectType, scope, depth });
    if (!members) return null;
    for (const member of members) {
      switch (member.type) {
        // unannotated `interface I { items; items: number[] }` declaration-merging: `break`
        // rather than `return null` so iteration continues to a typed sibling. without that,
        // the first hit halts the walk and over-emits the generic polyfill family
        case 'TSPropertySignature':
          if (!keyMatchesName(member.key, key) || !member.typeAnnotation) break;
          return withSubst(member.typeAnnotation);
        // getter: read the return; setter: continue iteration to a paired getter;
        // plain method: expose the full signature (see returnMemberMethodNode)
        case 'TSMethodSignature':
          if (!keyMatchesName(member.key, key)) break;
          if (member.kind === 'get') return withSubst(member.typeAnnotation ?? member.returnType);
          if (member.kind === 'set') break;
          return returnMemberMethodNode(member, subst);
        case 'ObjectTypeProperty':
          if (!keyMatchesName(member.key, key)) break;
          // Flow getter (`{ get items(): T }`) has kind 'get' with a FunctionTypeAnnotation
          // value: return its return type, not the function type itself (else `.at()` on the
          // result is dispatched against Function and the narrow is lost). setter: skip to a
          // paired getter. plain property / method value: return the value annotation
          if (member.kind === 'get') return withSubst(functionTypeReturnAnnotation(unwrapTypeAnnotation(member.value)));
          if (member.kind === 'set') break;
          return withSubst(member.value);
        case 'ClassProperty':         // flow
        case 'PropertyDefinition':    // babel TS / ESTree spec
        case 'ClassAccessorProperty': // babel decoratorAutoAccessors plugin
        case 'AccessorProperty':      // TC39 stage-4 auto-accessor: oxc / ESTree spec
          // class body property: typeAnnotation if present, otherwise `break` so a sibling
          // iface-merge property with the annotation supplies the type (`class C { items=[] };
          // interface C { items: number[] }`). returning null here would halt iteration and
          // over-emit the generic Maybe polyfill family. keep parser-shape list in sync with
          // `createClassMemberShape.isPropertyMember` in `class-member-shapes.js`
          if (!member.computed && keyMatchesName(member.key, key) && member.typeAnnotation) {
            return withSubst(member.typeAnnotation);
          }
          break;
        // getter: property access yields the return type (ESTree nests it on `.value.returnType`,
        // babel carries it directly). setter: `break` so iteration continues to a paired getter.
        // oxc models `abstract m(): T` as TSAbstractMethodDefinition (same `.value` wrap as
        // MethodDefinition; babel uses TSDeclareMethod, already listed) - matched identically
        case 'ClassMethod':
        case 'ClassPrivateMethod':
        case 'TSDeclareMethod':
        case 'MethodDefinition':
        case 'TSAbstractMethodDefinition':
          if (member.computed || !keyMatchesName(member.key, key)) break;
          if (member.kind === 'get') return withSubst(member.returnType ?? member.value?.returnType);
          if (member.kind === 'set') break;
          return returnMemberMethodNode(member, subst);
      }
    }
    const indexSig = pickIndexSignature(members, key);
    if (indexSig) return withSubst(indexSig);
    // Flow: ObjectTypeIndexer is stored separately on the type node, not in properties.
    // reuse the `aliased`/`subst` from the top-of-function `followTypeAliasChain` instead of
    // re-walking the alias chain - the chain is identity-stable and the two walks would
    // hit the same memoized cache, so a second call is pure overhead
    const flowType = aliased ?? objectType;
    if (flowType?.type === 'ObjectTypeAnnotation' && flowType.indexers?.length) {
      const indexerValue = flowType.indexers[0].value;
      // deep subst - Flow indexer value can be a wrapped generic (`{[K]: T[]}`)
      return subst ? applyAliasSubstDeep(indexerValue, subst) : indexerValue;
    }
    return null;
  }

  function reset() {
    getTypeMembersCache = new WeakMap();
  }

  return {
    findTypeMember,
    getTypeMembers,
    reset,
  };
}
