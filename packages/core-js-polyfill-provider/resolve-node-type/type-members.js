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
import { KEY_FILTERING_WRAPPERS, MAX_DEPTH, STRUCTURE_PRESERVING_WRAPPERS } from './base.js';
import {
  extendsId,
  isInterfaceDeclaration,
  isTypeAlias,
  synthInterfaceExtendsRef,
  typeAliasBody,
  typeRefSegments,
} from './ast-shapes.js';
import { getSuperTypeArgs, getTypeArgs } from '../helpers/ast-patterns.js';

export function createTypeMembers({
  unwrapTypeAnnotation,
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
  buildParentSubst,
  buildParentClassSubstFromNodes,
  substMembers,
  applySubst,
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
    const numIndex = typeof key === 'number' ? key : Number(key);
    if (!Number.isInteger(numIndex) || numIndex < 0) return null;
    const element = findTupleElement(node.objectType, numIndex, scope);
    return element ? getTypeMembers({ objectType: unwrapTypeAnnotation(element), scope, depth: depth + 1 }) : null;
  }

  // collect members of an interface declaration (including merged sibling interfaces and
  // every `extends`'d parent's members). `interface A extends B; interface B extends A` cycle:
  // MAX_DEPTH bottoms out via 64-frame CPU-burn. visited Set short-circuits at the second
  // visit - mirrors `resolveTypeAnnotation`'s decl-set guard (type aliases) and
  // `collectClassLikeMembers`'s `seen` Set (class-extends chains)
  function collectInterfaceMembers({ declaration, segments, scope, depth, visited }) {
    const seen = visited ?? new Set();
    if (seen.has(declaration)) return null;
    seen.add(declaration);
    const interfaces = findAllTypeDeclarations(segments, scope).filter(isInterfaceDeclaration);
    const all = [];
    for (const decl of interfaces) {
      // TS: decl.body.body, Flow: decl.body.properties
      const own = decl.body?.body ?? decl.body?.properties;
      if (own) for (const m of own) all.push(m);
      for (const parent of decl.extends ?? []) {
        // synth wraps both bare-Identifier and qualified-name extends; non-name shapes
        // fall back to raw expr so getTypeMembers's defensive null-on-unknown bails
        const parentRef = synthInterfaceExtendsRef(parent) ?? extendsId(parent);
        const parentMembers = getTypeMembers({ objectType: parentRef, scope, depth: depth + 1, visited: seen });
        if (!parentMembers) continue;
        all.push(...substMembers(parentMembers, buildParentSubst(parentRef, scope)));
      }
    }
    return all.length ? all : null;
  }

  function getTypeMembers({ objectType, scope, depth = 0, visited = undefined }) {
    if (depth > MAX_DEPTH) return null;
    if (objectType.type === 'TSTypeLiteral') return objectType.members;
    if (objectType.type === 'ObjectTypeAnnotation') return objectType.properties;
    if (objectType.type === 'TSIndexedAccessType') return resolveIndexedAccessMembers(objectType, scope, depth);
    // mapped type: trivial passthrough delegates to the source's members; `as`-rename
    // expands per-key with statically-evaluated rename templates so `r._a` on
    // `{ [K in keyof T as `_${K}`]: T[K] }` resolves through to the source field type
    if (objectType.type === 'TSMappedType') {
      const passthrough = unwrapMappedTypePassthrough(objectType);
      if (passthrough) return getTypeMembers({ objectType: unwrapTypeAnnotation(passthrough), scope, depth: depth + 1, visited });
      return expandMappedTypeMembers({ node: objectType, scope, depth, visited });
    }
    // intersection: collect members from all parts
    if (objectType.type === 'TSIntersectionType' || objectType.type === 'IntersectionTypeAnnotation') {
      const all = [];
      for (const member of objectType.types) {
        const members = getTypeMembers({ objectType: unwrapTypeAnnotation(member), scope, depth: depth + 1, visited });
        if (members) for (const m of members) all.push(m);
      }
      return all.length ? all : null;
    }
    // handle dotted refs (`NS.Data`) by passing the segment path through
    const segments = typeRefSegments(objectType);
    if (!segments) return null;
    // structure-preserving wrappers: `Readonly<{...}>.x` / `Pick<T, 'a'>.x` look up on T.
    // Pick / Omit narrow the member set when their second arg is statically-evaluable
    // (literal / literal-union); otherwise passthrough as over-emit (per §6 accepted)
    if (segments.length === 1 && STRUCTURE_PRESERVING_WRAPPERS.has(segments[0])) {
      return resolveStructureWrapperMembers({ wrapperName: segments[0], objectType, scope, depth, visited });
    }
    // `Record<K, V>` - every member access returns V. emit a synthetic index signature so
    // findTypeMember's TSIndexSignature fallback picks it up for any key
    if (segments.length === 1 && segments[0] === 'Record') {
      const params = getTypeArgs(objectType)?.params;
      if (params?.[1]) return [{
        type: 'TSIndexSignature',
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
        const { node: aliased, subst } = followTypeAliasChain(unwrapTypeAnnotation(arg), scope);
        const ret = functionTypeReturnAnnotation(unwrapTypeAnnotation(aliased));
        if (!ret) return null;
        const target = applySubst(ret, subst);
        return getTypeMembers({ objectType: unwrapTypeAnnotation(target), scope, depth: depth + 1, visited });
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
      const subst = buildCallSiteSubst(resolved.node, arg);
      return getTypeMembers({ objectType: applySubst(target, subst), scope, depth: depth + 1, visited });
    }
    // fast path first; only re-walk for the rare interface-merging case
    const declaration = findTypeDeclaration(segments, scope);
    if (!declaration) return null;
    // class / interface declarations: substitute receiver's type-args into member annotations
    // so `class C<T> { f(): T[] } interface C<T> { g: T }; declare const x: C<string>; x.f()[0]`
    // and `x.g` see concrete `string` instead of raw type-param. parent-extends chain (class
    // superClass / interface extends) carries its own subst per-hop in collectors. for the
    // class-like branch `collectClassLikeMembers` does per-source subst internally (each iface
    // gets its own remapped subst for renamed type-params); for the interface-only branch the
    // outer subst is correct because all merged-iface decls share the same param names per TS
    const receiverArgs = getTypeArgs(objectType)?.params;
    if (isInterfaceDeclaration(declaration)) {
      const subst = buildSubstMap(declaration.typeParameters?.params, receiverArgs);
      return substMembers(collectInterfaceMembers({ declaration, segments, scope, depth, visited }), subst);
    }
    if (isClassLikeDeclaration(declaration)) {
      return collectClassLikeMembers({ declaration, segments, scope, depth, receiverArgs });
    }
    if (isTypeAlias(declaration)) {
      // substitute the alias's type params into member annotations so
      // `type Dict<V> = { [k: string]: V }` + `Dict<number[]>[string]` resolves V to number[]
      const subst = buildSubstMap(declaration.typeParameters?.params, receiverArgs);
      return substMembers(
        getTypeMembers({ objectType: unwrapTypeAnnotation(typeAliasBody(declaration)), scope, depth: depth + 1, visited }),
        subst,
      );
    }
    return null;
  }

  // class-as-type with TS declaration merging: non-static body entries up the superClass chain
  // (real and ambient parents) plus every sibling `interface <name>` body + its extends chain.
  // `receiverArgs` are the receiver's type-args (e.g. `[string[]]` for `C<string[]>`); each
  // source declaration (class chain / each iface) gets its own subst built from its own
  // type-param names against the same args - lets renamed params on the interface side
  // (`class C<T>` + `interface C<U>`) substitute correctly. members are returned already
  // substituted so callers must NOT apply an outer subst on top
  // append all merged sibling interface members for a class name into `out`, with each iface
  // building its own subst against ITS type-param names from `receiverArgs`. covers renamed
  // params on the interface side of class+interface merging. walks `extends A, B` parents
  // of every matched iface too
  function appendMergedInterfaceMembers({ segments, scope, depth, out, receiverArgs }) {
    if (!segments) return;
    for (const iface of findAllTypeDeclarations(segments, scope).filter(isInterfaceDeclaration)) {
      const ifaceSubst = buildSubstMap(iface.typeParameters?.params, receiverArgs);
      const ifaceBody = iface.body?.body ?? iface.body?.properties ?? [];
      out.push(...substMembers(ifaceBody, ifaceSubst));
      appendInterfaceExtendsMembers({ iface, scope, depth, out, ifaceSubst });
    }
  }

  function collectClassLikeMembers({ declaration, segments, scope, depth, receiverArgs }) {
    // walk superClass chain with per-class subst derivation: each parent's typeParameters
    // get bound from the current class's `extends Parent<...>` type-args (with the current
    // subst already applied). `class Child<Y> extends Parent<Y[]>` correctly maps Parent's
    // `<X> -> Y[]` then `Y -> string`. on every hop also pull merged sibling interfaces for
    // the current class - inherited iface members must surface on subclasses (TS declaration
    // merging). receiver's iface lookup uses the user-passed `segments` (may be multi-segment
    // qualified name `NS.Foo`); parents are matched by their bare id name. parent receiverArgs
    // come from the previous class's `extends Parent<...>` slot. seen-set prevents cycles
    const merged = [];
    const seen = new Set();
    let cur = declaration;
    let curSubst = buildSubstMap(declaration.typeParameters?.params, receiverArgs);
    let curReceiverArgs = receiverArgs;
    while (cur && !seen.has(cur)) {
      seen.add(cur);
      const ownBody = (cur.body?.body ?? []).filter(m => !m?.static);
      merged.push(...substMembers(ownBody, curSubst));
      const lookupSegments = cur === declaration ? segments : (cur.id?.name ? [cur.id.name] : null);
      appendMergedInterfaceMembers({ segments: lookupSegments, scope, depth, out: merged, receiverArgs: curReceiverArgs });
      const parent = findParentClassDecl(cur, scope);
      if (!parent) break;
      curSubst = buildParentClassSubstFromNodes(cur, parent, curSubst);
      curReceiverArgs = getSuperTypeArgs(cur)?.params ?? null;
      cur = parent;
    }
    return merged.length ? merged : null;
  }

  // walk `interface X extends A, B` parents. each parent's members carry through the
  // `buildParentSubst` mapping so `A<T>.m: T` becomes `m: <instantiated>`. `ifaceSubst`
  // (when present) is applied to parentRef's args first, so `extends Base<U>` with
  // iface `U -> string` becomes `Base<string>` before descending - parent subst then
  // sees the substituted slot
  function appendInterfaceExtendsMembers({ iface, scope, depth, out, ifaceSubst }) {
    for (const parent of iface.extends ?? []) {
      // synthInterfaceExtendsRef builds a TSTypeReference wrapping parent's id + args
      // for both bare Identifier and qualified-name shapes; raw `expr` lacks args
      // (those live on `parent`), so qualified extends previously dropped the typeArgs slot
      const parentRef = synthInterfaceExtendsRef(parent);
      if (!parentRef) continue;
      const expanded = ifaceSubst ? applySubstToTypeRefArgs(parentRef, ifaceSubst) : parentRef;
      const parentMembers = getTypeMembers({ objectType: expanded, scope, depth: depth + 1 });
      if (!parentMembers) continue;
      out.push(...substMembers(parentMembers, buildParentSubst(expanded, scope)));
    }
  }

  // expand `<Wrapper><T, ...>` members for the structure-preserving wrappers set.
  // transparent wrappers (`Readonly` / `Partial` / etc) pass through to T's members.
  // key-filtering wrappers (`Pick` / `Omit`) filter T's members when the keys arg is
  // statically-evaluable; non-decidable keys-arg falls back to passthrough (over-emit
  // per §6 accepted - safer to over-resolve member access than under-resolve)
  // expand `<Wrapper><T, ...>` members for the structure-preserving wrappers set.
  // transparent wrappers (`Readonly` / `Partial` / etc) pass through to T's members.
  // key-filtering wrappers (`Pick` / `Omit`) filter T's members when the keys arg is
  // statically-evaluable; non-decidable keys-arg falls back to passthrough (over-emit
  // per §6 accepted - safer to over-resolve member access than under-resolve)
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

  // mixed `{[k:number]:A; [k:string]:B}` index signatures resolve per-lookup: numeric keys ->
  // number sig, string keys -> string sig (permissive fallback when only one sig is declared)
  function pickIndexSignature(members, key) {
    let numberSig = null;
    let stringSig = null;
    let symbolSig = null;
    for (const member of members) {
      if (member.type !== 'TSIndexSignature' || !member.typeAnnotation) continue;
      const keyType = member.parameters?.[0]?.typeAnnotation?.typeAnnotation?.type;
      if (keyType === 'TSNumberKeyword') numberSig ??= member.typeAnnotation;
      else if (keyType === 'TSSymbolKeyword') symbolSig ??= member.typeAnnotation;
      else stringSig ??= member.typeAnnotation;
    }
    const isNumericKey = typeof key === 'number' || /^-?\d+$/.test(String(key));
    return isNumericKey ? (numberSig ?? stringSig) : (stringSig ?? numberSig ?? symbolSig);
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
      return findTypeMember({ objectType: withSubst(branch ? aliased.trueType : aliased.falseType), key, scope, depth: depth + 1 });
    }
    const resolved = evaluateConditionalType(applySubst(aliased, subst), null, scope, depth + 1, null);
    if (resolved) return findTypeMember({ objectType: resolved, key, scope, depth: depth + 1 });
    const trueResult = findTypeMember({ objectType: withSubst(aliased.trueType), key, scope, depth: depth + 1 });
    const falseResult = findTypeMember({ objectType: withSubst(aliased.falseType), key, scope, depth: depth + 1 });
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
  // ClassPrivateMethod) used to fold to `{ type: 'TSFunctionType' }` - sufficient for the
  // "this is a function-typed slot" answer but loses parameters + return type, breaking
  // `ReturnType<typeof X.method>` / `Parameters<typeof X.method>`. expose the full signature
  // so `functionTypeReturnAnnotation` and friends can read the slots; subst applied deeply
  // so type-ref substitution composes into return type / parameter types. `resolveTypeAnnotation`
  // maps the same node kinds back to `$Object('Function')` for property-access semantics
  function returnMemberMethodNode(member, subst) {
    return subst ? applyAliasSubstDeep(member, subst) : member;
  }

  function findTypeMember({ objectType, key, scope, depth = 0 }) {
    if (!objectType || depth > MAX_DEPTH) return null;
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
    const passthrough = unwrapPassthroughWrapper(aliased ?? objectType, scope);
    if (passthrough) {
      const substituted = applySubst(passthrough, subst);
      return findTypeMember({ objectType: substituted, key, scope, depth: depth + 1 });
    }
    const withSubst = node => {
      if (!node) return node;
      const unwrapped = unwrapTypeAnnotation(node);
      return applySubst(unwrapped, subst);
    };
    // conditional types route through dedicated helper: extracts the branch-pick logic
    // (AST equality > structural Type Object eval > infer-pattern fallback > undecidable
    // union fold) into one place. without the extraction, findTypeMember exceeds the
    // max-statements lint threshold and the member-lookup-on-conditional path becomes
    // hard to reason about
    if (aliased?.type === 'TSConditionalType') {
      return findConditionalTypeMember({ aliased, subst, key, scope, depth, withSubst });
    }
    const resolveBranch = member => findTypeMember({ objectType: withSubst(unwrapTypeAnnotation(member)), key, scope, depth: depth + 1 });
    if (aliased?.type === 'TSUnionType' || aliased?.type === 'UnionTypeAnnotation') {
      const found = aliased.types.map(resolveBranch).filter(Boolean);
      if (!found.length) return null;
      if (found.length === 1) return found[0];
      return { type: aliased.type, types: found };
    }
    // intersection: first match wins - parts contribute disjoint keys (duplicate-key
    // intersections are ill-formed at the TS level anyway)
    if (aliased?.type === 'TSIntersectionType' || aliased?.type === 'IntersectionTypeAnnotation') {
      for (const member of aliased.types) {
        const resolved = resolveBranch(member);
        if (resolved) return resolved;
      }
      return null;
    }
    // tuple numeric index: `type Pair<T> = [T[], string]` / `Pair<number>[0]` -> `number[]`.
    // `length` resolves to the tuple's static arity (`number` literal); handle separately
    // so `Number('length') = NaN` doesn't silently drop the lookup
    if (aliased?.type === 'TSTupleType' || aliased?.type === 'TupleTypeAnnotation') {
      if (key === 'length') return { type: 'TSNumberKeyword' };
      const index = typeof key === 'number' ? key : Number(key);
      if (!Number.isInteger(index) || index < 0) return null;
      const element = findTupleElement(aliased, index, scope);
      return element ? applySubst(element, subst) : null;
    }
    // walk through trivial mapped passthroughs / aliases when looking up members
    const members = getTypeMembers({ objectType: aliased ?? objectType, scope, depth });
    if (!members) return null;
    for (const member of members) {
      switch (member.type) {
        case 'TSPropertySignature':
        case 'TSMethodSignature':
          if (keyMatchesName(member.key, key)) {
            if (member.type !== 'TSMethodSignature') return withSubst(member.typeAnnotation);
            // getter: read the return; setter: continue iteration to a paired getter;
            // plain method: expose the full signature (see returnMemberMethodNode)
            if (member.kind === 'get') return withSubst(member.typeAnnotation ?? member.returnType);
            if (member.kind === 'set') break;
            return returnMemberMethodNode(member, subst);
          }
          break;
        case 'ObjectTypeProperty':
          if (keyMatchesName(member.key, key)) return withSubst(member.value);
          break;
        case 'ClassProperty':
        case 'PropertyDefinition':
        case 'ClassAccessorProperty':
          // class body property: typeAnnotation if present, otherwise we can't infer the type
          if (!member.computed && keyMatchesName(member.key, key)) return withSubst(member.typeAnnotation ?? null);
          break;
        // getter: property access yields the return type (ESTree nests it on `.value.returnType`,
        // babel carries it directly). setter: `break` so iteration continues to a paired getter
        case 'ClassMethod':
        case 'ClassPrivateMethod':
        case 'TSDeclareMethod':
        case 'MethodDefinition':
          if (member.computed || !keyMatchesName(member.key, key)) break;
          if (member.kind === 'get') return withSubst(member.returnType ?? member.value?.returnType);
          if (member.kind === 'set') break;
          return returnMemberMethodNode(member, subst);
      }
    }
    const indexSig = pickIndexSignature(members, key);
    if (indexSig) return withSubst(indexSig);
    // Flow: ObjectTypeIndexer stored separately in the type node, not in properties
    // resolve through type aliases since getTypeMembers follows aliases but returns only properties
    let resolvedType = objectType;
    let flowSubst = null;
    if (resolvedType.type !== 'ObjectTypeAnnotation') {
      const followed = followTypeAliasChain(resolvedType, scope);
      if (followed.node) {
        resolvedType = followed.node;
        flowSubst = followed.subst;
      }
    }
    if (resolvedType.type === 'ObjectTypeAnnotation' && resolvedType.indexers?.length) {
      const indexerValue = resolvedType.indexers[0].value;
      // deep subst - Flow indexer value can be a wrapped generic (`{[K]: T[]}`)
      return flowSubst ? applyAliasSubstDeep(indexerValue, flowSubst) : indexerValue;
    }
    return null;
  }

  return {
    findTypeMember,
    getTypeMembers,
  };
}
