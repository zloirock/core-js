// Type-member resolution. dispatches member access against any TS / Flow type-position node:
//   - `findTypeMember({objectType, key, scope, depth, modifiers})` - extract a member's annotation
//     node by key; covers interface bodies + class merging + tuple indexing + index signatures +
//     conditional / mapped / structure-preserving wrappers + alias chain. `modifiers` is the
//     descriptor-flag delta of the wrappers already peeled above the current node - callers start
//     it absent and the walk accumulates it
//   - `getTypeMembers({objectType, scope, depth, visited})` - flat list of structural members
//     for a given type node (used by callers iterating all members; rest of the cluster +
//     callers like `discriminant-narrow` / `call-resolution`)
//
// Most surface is cluster-private (recursive cascade between findTypeMember <->
// getTypeMembers, the interface / class collectors, condition / indexed-access helpers).
// External callers see only `findTypeMember`, `getTypeMembers` and `reset`. `findParentClassDecl`,
// `resolveIndexedAccessMembers` and `pickIndexSignature` are cluster-private despite the mirrors
// elsewhere naming them: neighbouring files cite `pickIndexSignature` as the static-key twin of
// their own dynamic-key pick, and that is a cross-reference, not a call.
import {
  canonicalArrayIndex,
  KEY_FILTERING_WRAPPERS,
  MAX_DEPTH,
  MODIFIER_WRAPPER_DELTAS,
  STRUCTURE_PRESERVING_WRAPPERS,
} from './base.js';
import {
  applyMemberModifierDelta,
  composeModifierDeltas,
  interfaceBodyMembers,
  internedTypeRef,
  isInterfaceDeclaration,
  isReadonlyArrayType,
  isTypeAlias,
  isUnionType,
  modifierWrapperDelta,
  synthInterfaceExtendsRef,
  typeAliasBody,
  typeRefName,
  typeRefSegments,
  TS_NUMBER_TYPE,
  unionAnnotationOf,
  withMemberModifiers,
} from './ast-shapes.js';
import { getHeritageTypeArgs, getTypeArgs } from '../helpers/ast-patterns.js';

export function createTypeMembers({
  memoize,
  unwrapTypeAnnotation,
  peelTSParenthesized,
  isNullableOrNeverAnnotation,
  isClassLikeDeclaration,
  keyMatchesName,
  getKeyName,
  literalKeyValue,
  matchTemplatePattern,
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
  isUnconstrainedTypeShape,
  pickConditionalBranchVia,
  resolveTypeQueryBinding,
  resolveIndexedAccessMemberAnnotationAST,
  buildCallSiteSubst,
  resolveTypeAnnotation,
  functionTypeReturnAnnotation,
  unwrapPassthroughWrapper,
  passthroughModifierDelta,
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
  function resolveIndexedAccessMembers(node, scope, depth, visited) {
    // the annotation half is the canonical indexed-access peel: it grows the budget on the way
    // into the member lookup - so a self-referential `type R = R['k']` runs out instead of
    // recursing forever - and carries the method-shape probe and the cross-parser return slot
    // that a second spelling here had drifted away from
    const annotation = resolveIndexedAccessMemberAnnotationAST(node, scope, depth);
    if (annotation) return getTypeMembers({ objectType: annotation, scope, depth: depth + 1, visited });
    // numeric-key tuple fallback: `Parameters<typeof fn>[0].x` - findTypeMember can't see
    // the tuple shape (Parameters is not in STRUCTURE_PRESERVING_WRAPPERS and getTypeMembers
    // returns null for the special built-in), but findTupleElement resolves it via
    // resolveParametersParams. parity with `resolveIndexedAccessType`'s numeric branch
    const key = indexedAccessKey(node.indexType);
    const numIndex = key === null ? null : canonicalArrayIndex(key);
    if (numIndex === null) return null;
    const element = findTupleElement(node.objectType, numIndex, scope);
    return element ? getTypeMembers({ objectType: unwrapTypeAnnotation(element), scope, depth: depth + 1, visited }) : null;
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
  // that need cycle protection.
  // a depth-capped null is cached and served even when the same (objectType, scope) pair is
  // later reached at a shallower depth: pathological by construction (takes wrapper nesting
  // near the depth cap), and the miss direction is a safe under-resolve
  let getTypeMembersCache = new WeakMap();
  function getTypeMembers(args) {
    if (args.visited) return computeGetTypeMembers(args);
    // a MAX_DEPTH refusal belongs to the CALL, not to the node: the memo is keyed by node and
    // scope only, so caching that null would answer a later SHALLOW lookup of the same node with
    // the deep lookup's bail. take the guard before the cache and leave the slot unfilled
    if ((args.depth ?? 0) > MAX_DEPTH) return null;
    const { objectType, scope } = args;
    let perObject = getTypeMembersCache.get(objectType);
    if (!perObject) getTypeMembersCache.set(objectType, perObject = new WeakMap());
    return memoize(perObject, scope, () => computeGetTypeMembers(args));
  }

  // Flow keeps INDEXERS in their own slot, so returning `properties` alone loses them and every
  // consumer that asks the index-signature question comes back empty. mirror each one into the
  // TSIndexSignature shape the consumers already understand - the same synthetic trick the
  // `Record<K, V>` expansion uses
  function flowObjectTypeMembers(objectType) {
    const indexers = objectType.indexers ?? [];
    // the no-indexer path keeps handing back the raw slot: an ABSENT `properties` means "unknown"
    // to callers, while `[]` means "no members", and collapsing the two would turn a bail into a
    // narrow. the spread below is the only place that must not trip over the absent slot
    if (!indexers.length) return objectType.properties;
    return [...objectType.properties ?? [], ...indexers.map(indexer => ({
      type: 'TSIndexSignature',
      parameters: [{
        type: 'Identifier',
        typeAnnotation: { type: 'TSTypeAnnotation', typeAnnotation: indexer.key },
      }],
      typeAnnotation: { type: 'TSTypeAnnotation', typeAnnotation: indexer.value },
    }))];
  }

  function computeGetTypeMembers({ objectType, scope, depth = 0, visited = undefined }) {
    if (depth > MAX_DEPTH) return null;
    // leading TSParenthesizedType (`({ ... })['k']`) - passthrough to the inner type's members
    // (oxc preserves the wrapper; babel keeps it in member position)
    if (objectType.type === 'TSParenthesizedType') {
      return getTypeMembers({ objectType: peelTSParenthesized(objectType), scope, depth: depth + 1, visited });
    }
    // a synthetic TSOptionalType (from `withMemberModifiers` on an optional member `a?: T`) carries the
    // undefined possibility, but its MEMBERS are the inner type's - a multi-hop re-feed that leaves
    // the wrapper in place bottoms out to null here and the whole chain bails (-> over-inject)
    if (objectType.type === 'TSOptionalType') {
      return getTypeMembers({ objectType: objectType.typeAnnotation, scope, depth: depth + 1, visited });
    }
    if (objectType.type === 'TSTypeLiteral') return objectType.members;
    if (objectType.type === 'ObjectTypeAnnotation') return flowObjectTypeMembers(objectType);
    // both TS `T[K]` and Flow `T[K]` (IndexedAccessType) route through the same resolver
    if (objectType.type === 'TSIndexedAccessType' || objectType.type === 'IndexedAccessType') {
      return resolveIndexedAccessMembers(objectType, scope, depth, visited);
    }
    if (objectType.type === 'TSMappedType') return resolveMappedTypeMembers({ objectType, scope, depth, visited });
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
    // a USER declaration of the same name wins over the built-in utility branches below: those
    // branches read the type ARGUMENTS the way the global utility defines them, so serving them for
    // `interface Record<K, V> { stored: number[] }` answers with a synthetic index signature and the
    // real member is never seen (a missed polyfill, not just lost precision). looked up only for the
    // handful of names that actually collide, so the common path keeps its single declaration walk
    const builtInName = segments.length === 1 && (STRUCTURE_PRESERVING_WRAPPERS.has(segments[0])
      || segments[0] === 'Record' || segments[0] === 'InstanceType' || segments[0] === 'ReturnType')
      ? segments[0] : null;
    const shadowedByUserType = builtInName !== null && !!findTypeDeclaration(segments, scope);
    // structure-preserving wrappers: `Readonly<{...}>.x` / `Pick<T, 'a'>.x` look up on T.
    // Pick / Omit narrow the member set when their second arg is statically-evaluable
    // (literal / literal-union); otherwise passthrough as over-emit (per spec section 6 accepted)
    if (!shadowedByUserType && segments.length === 1 && STRUCTURE_PRESERVING_WRAPPERS.has(segments[0])) {
      return resolveStructureWrapperMembers({ wrapperName: segments[0], objectType, scope, depth, visited });
    }
    // `Record<K, V>` - every member access returns V. emit a synthetic index signature so
    // findTypeMember's TSIndexSignature fallback picks it up for any key
    if (!shadowedByUserType && segments.length === 1 && segments[0] === 'Record') {
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
    if (!shadowedByUserType && segments.length === 1
      && (segments[0] === 'InstanceType' || segments[0] === 'ReturnType')) {
      // peeled like the type-annotation-resolve twin: oxc keeps `ReturnType<(typeof f)>`
      // arg as TSParenthesizedType where babel strips it
      const arg = peelTSParenthesized(getTypeArgs(objectType)?.params?.[0]);
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
        ? internedTypeRef(resolved.node.id)
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
      return collectClassLikeMembers({ declaration, segments, scope, depth, receiverArgs, visited });
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

  function collectClassLikeMembers({ declaration, segments, scope, depth, receiverArgs, visited }) {
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
      // inherited member from such a parent surfaces on the subclass too - that dialect pair is
      // `interfaceBodyMembers`, which this file already imports
      const ownBody = interfaceBodyMembers(cur).filter(m => !m?.static);
      merged.push(...substMembers(ownBody, curSubst));
      const lookupSegments = cur === declaration ? segments : (cur.id?.name ? [cur.id.name] : null);
      appendMergedInterfaceMembers({
        segments: lookupSegments, scope, depth, out: merged, receiverArgs: curReceiverArgs, visited,
      });
      const parent = findParentClassDecl(cur, scope);
      if (!parent) break;
      // raw super-args (`extends Mid<T>`) reference cur's type params; apply curSubst FIRST
      // so the next hop's iface lookup receives concrete args, not raw param refs. example:
      // `Sub extends Mid<string[]>; Mid<T> extends Base<T>; interface Base<U> { items: U[] }`
      // - iteration cur=Mid sets up parent=Base. Without subst, [T] propagates to Base's iface
      // lookup where ifaceSubst {U->T} resolves items to T[]. With subst applied, [string[]]
      // propagates -> {U->string[]} -> items resolves to string[][]
      // the heritage accessor covers the Flow ambient spelling too: without it the generic
      // subst into inherited members silently drops and the member resolves to null
      // (over-injection)
      const rawSuperArgs = getHeritageTypeArgs(cur)?.params;
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

  // mapped type: a trivial passthrough delegates to the source's members, an `as`-rename expands
  // per-key with statically-evaluated rename templates so `r._a` on `{ [K in keyof T as `_${K}`]: T[K] }`
  // resolves through to the source field type. the passthrough hands over the member SET but not the
  // `?` / `-?` modifier sitting on the mapped type itself - re-applied here, exactly as the
  // utility-wrapper lane does (the expansion lane stamps it per member instead, in `buildMappedMember`)
  function resolveMappedTypeMembers({ objectType, scope, depth, visited }) {
    const passthrough = unwrapMappedTypePassthrough(objectType);
    if (!passthrough) return expandMappedTypeMembers({ node: objectType, scope, depth, visited });
    const inner = getTypeMembers({ objectType: unwrapTypeAnnotation(passthrough), scope, depth: depth + 1, visited });
    return applyMemberModifierDelta(inner, modifierWrapperDelta(objectType));
  }

  // expand `<Wrapper><T, ...>` members. transparent wrappers (`Readonly` / `Partial`)
  // pass through to T's members. `Pick` / `Omit` filter T's members when keys arg is
  // statically-evaluable; non-decidable keys-arg falls back to passthrough (over-emit
  // safer than under-resolve)
  function resolveStructureWrapperMembers({ wrapperName, objectType, scope, depth, visited }) {
    const args = getTypeArgs(objectType)?.params;
    const arg = args?.[0];
    if (!arg) return null;
    const inner = getTypeMembers({ objectType: unwrapTypeAnnotation(arg), scope, depth: depth + 1, visited });
    // a modifier wrapper's whole effect is on the descriptor flags of the members it passes
    // through - handing the inner list back verbatim is what made `Partial<T>` a no-op
    const innerMembers = applyMemberModifierDelta(inner, MODIFIER_WRAPPER_DELTAS.get(wrapperName));
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

  // does an index signature whose key type is neither `string` nor `number` nor `symbol` admit this
  // key? the template half routes through the SHARED pattern matcher rather than a second reading
  // of the same grammar; a union asks each arm, a literal compares its value
  function indexSignatureAdmitsKey(keyNode, key) {
    if (!keyNode) return false;
    if (keyNode.type === 'TSUnionType') {
      return keyNode.types.some(arm => indexSignatureAdmitsKey(peelTSParenthesized(arm), key));
    }
    const template = matchTemplatePattern(keyNode, String(key));
    if (template !== null) return template;
    if (keyNode.type === 'TSLiteralType') {
      const value = literalKeyValue(keyNode.literal);
      return value !== null && String(value) === String(key);
    }
    return false;
  }

  // mixed `{[k:number]:A; [k:string]:B}` index signatures resolve per-lookup: a numeric key may
  // fall back to the string signature (numeric keys coerce to string keys), but a non-numeric
  // string key resolves only via the string signature. a key type that is none of the three keywords
  // spells the keys it admits (a template, a literal, a union of those) and answers through
  // `indexSignatureAdmitsKey`; a signature it names OUTRANKS the permissive string one. unwrap the
  // TSTypeAnnotation wrapper THEN peel TSParenthesizedType - oxc preserves `(string)` as
  // TSParenthesizedType, and the discriminator check below compares against bare keyword types
  function pickIndexSignature(members, key) {
    let numberSig = null;
    let stringSig = null;
    let patternSig = null;
    for (const member of members) {
      if (member.type !== 'TSIndexSignature' || !member.typeAnnotation) continue;
      const keyNode = peelTSParenthesized(unwrapTypeAnnotation(member.parameters?.[0]?.typeAnnotation));
      const keyType = keyNode?.type;
      switch (keyType) {
        case 'TSNumberKeyword': numberSig ??= member.typeAnnotation; break;
        // a symbol index signature is never selectable by a string / number property key; skip it so
        // it cannot be mistaken for the (otherwise permissive) string signature in the final fallback
        case 'TSSymbolKeyword': break;
        case 'TSStringKeyword': stringSig ??= member.typeAnnotation; break;
        // any OTHER key type spells the keys it admits and no others (a template, a literal, a union
        // of those). reading it as the permissive string signature answered a key the signature does
        // not admit with its value type - a member TS does not give the source at all
        default: if (indexSignatureAdmitsKey(keyNode, key)) patternSig ??= member.typeAnnotation;
      }
    }
    const isNumericKey = typeof key === 'number' || /^-?\d+$/.test(String(key));
    // a number-only / symbol-only index type has no member for a non-numeric string key, so
    // returning the number / symbol value type there would be over-emission, not a real member.
    // a matched pattern outranks the permissive string signature - it named this key
    return isNumericKey ? (numberSig ?? patternSig ?? stringSig) : (patternSig ?? stringSig);
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
  //   3) undecidable - fold both branches into a synthetic union for findTypeMember's
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
    // a readonly check side (`readonly string[]`) is NOT assignable to a MUTABLE `Array<infer U>` pattern -
    // TS picks the FALSE branch. bind U only when the pattern is itself readonly OR the check is mutable;
    // else arrayElementType's readonly-peel would wrongly match and fire the TRUE branch (over-resolve)
    const inferElement = inferName
      && (isReadonlyArrayType(aliased.extendsType) || !isReadonlyArrayType(checkSubst))
      ? arrayElementType(checkSubst) : null;
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
      isUnconstrained: isUnconstrainedTypeShape(extendSubst),
    });
    if (branch !== null) {
      return findTypeMember({ objectType: innerWithSubst(branch ? aliased.trueType : aliased.falseType), key, scope, depth: depth + 1 });
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
    return unionAnnotationOf([trueViable, falseViable]);
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
      if (key === 'length') return TS_NUMBER_TYPE;
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

  function findTypeMember({ objectType, key, scope, depth = 0, modifiers = null }) {
    while (true) {
      if (!objectType || depth > MAX_DEPTH) return null;
      // peel a leading TSParenthesizedType (`(A | B)['k']`) so the union / intersection / structural
      // dispatch below sees the raw discriminated shape, not the wrapper (branch-level peel is withSubst)
      objectType = peelTSParenthesized(objectType);
      // unions: recurse per branch (with subst applied), fold matches into a synthetic union.
      // union member may itself be a wrapped generic (`Inner<T>` / `T[]`); deep subst
      // descends into the inner type-param
      const { node: aliased, subst, modifiers: aliasModifiers } = followTypeAliasChain(objectType, scope);
      // the alias walk peels a trivial mapped passthrough of its own - take its delta before the
      // wrapper it came from is out of reach
      modifiers = composeModifierDeltas(modifiers, aliasModifiers);
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
      const substituted = applySubst(aliased ?? objectType, subst);
      const passthrough = unwrapPassthroughWrapper(substituted, scope, depth);
      if (passthrough) {
        // a modifier wrapper changes the descriptor FLAGS of the members it passes through,
        // and the peel above is about to make it invisible - record its delta so the return
        // points below answer with the flags the wrapper imposes, not the inner member's own.
        // outermost wins: `Partial<Required<T>>` is read outside-in
        modifiers = composeModifierDeltas(modifiers, passthroughModifierDelta(substituted, scope, passthrough, depth));
        objectType = passthrough;
        depth += 1;
        continue;
      }
      function withSubst(node) {
        if (!node) return node;
        // peel TSParenthesizedType (oxc preserves `(B)` / `(B | C)` as a wrapper; babel keeps it
        // in member position too) so union / intersection branch recursion and member-type
        // returns see the raw discriminated shape instead of bailing on the wrapper
        const unwrapped = peelTSParenthesized(unwrapTypeAnnotation(node));
        return applySubst(unwrapped, subst);
      }
      // an optional property (`a?: T`) admits undefined even on a present receiver; the
      // signature's own `optional` flag would otherwise be dropped when only the annotation
      // is returned. every member-annotation return point goes through here, so a getter or
      // method return is marked on the same terms as a property - and a modifier wrapper
      // peeled above overrides the member's own flags, which is what `Partial<T>` means
      function withMarkers(annotation, member = null) {
        // THREE states, not two: a wrapper delta decides, else the member's own flag decides, and
        // with NEITHER the annotation is left alone. `optional: false` is a REMOVAL in the marker
        // contract, so passing it as "nothing known" would strip a slot's own source-level `?`
        const optional = modifiers?.optional ?? (member ? Boolean(member.optional) : undefined);
        return optional === undefined ? annotation : withMemberModifiers(annotation, { optional });
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
      // union: `(A | B)['k']` is `A['k'] | B['k']`.
      // intersection: `(A & B)['k']` is `A['k'] & B['k']` - a key declared in several constituents
      // contributes the INTERSECTION of its per-constituent member types, not the first hit. both
      // are the SAME resolution - map the constituents, drop the misses, rebuild the composite under
      // the original node type - so they share one branch; the downstream `foldIntersectionTypes`
      // prefers the array / string-like constituent over a bare object, so a non-array member listed
      // before an array member no longer shadows the array polyfill
      if (isUnionType(aliased) || aliased?.type === 'TSIntersectionType'
        || aliased?.type === 'IntersectionTypeAnnotation') {
        const found = aliased.types.map(resolveBranch).filter(Boolean);
        if (!found.length) return null;
        if (found.length === 1) return found[0];
        return { type: aliased.type, types: found };
      }
      // the tuple / array ELEMENT return is a member-annotation return like every other one below,
      // so it owes the accumulated wrapper delta: `Partial<[T, U]>[0]` reached here without it and
      // served the element's own family to a slot the wrapper made optional. `length` is a number
      // and carries no optionality, which the marker writer already answers by node type
      const indexedElement = tryIndexedElementMember({ aliased, key, scope, subst });
      if (indexedElement) return withMarkers(indexedElement);
      // walk through trivial mapped passthroughs / aliases when looking up members
      const members = getTypeMembers({ objectType: aliased ?? objectType, scope, depth });
      if (!members) return null;
      for (const member of members) {
        switch (member.type) {
          // unannotated `interface I { items; items: number[] }` declaration-merging: `break`
          // rather than `return null` so iteration continues to a typed sibling. without that,
          // the first hit halts the walk and over-emits the generic polyfill family
          case 'TSPropertySignature':
            if (!keyMatchesName(member.key, key, scope, member.computed) || !member.typeAnnotation) break;
            return withMarkers(withSubst(member.typeAnnotation), member);
          // getter: read the return; setter: continue iteration to a paired getter;
          // plain method: expose the full signature (see returnMemberMethodNode). this arm alone
          // skips the shared marker step, and that is NOT free - `m?(): T` and `m?: () => T` are
          // one thing to TS yet answer differently about the value being possibly-undefined.
          // routing it through `withMarkers` was MEASURED and regresses a working narrow: the
          // marker reaches the CALL spine, where a destructured optional method (`const { m } = i;
          // m!()`) then bails to generic. a fix needs a channel that reaches the value-read fold
          // without reaching the call - see the queue entry
          case 'TSMethodSignature':
            if (!keyMatchesName(member.key, key, scope, member.computed)) break;
            if (member.kind === 'get') {
              // an UNANNOTATED getter must `break`, not return: halting the walk here loses a
              // typed sibling from declaration merging, which is exactly what the property arms
              // above are careful to keep reachable
              const got = member.typeAnnotation ?? member.returnType;
              if (!got) break;
              return withMarkers(withSubst(got));
            }
            if (member.kind === 'set') break;
            return returnMemberMethodNode(member, subst);
          case 'ObjectTypeProperty':
            if (!keyMatchesName(member.key, key, scope, member.computed)) break;
            // Flow getter (`{ get items(): T }`) has kind 'get' with a FunctionTypeAnnotation
            // value: return its return type, not the function type itself (else `.at()` on the
            // result is dispatched against Function and the narrow is lost). setter: skip to a
            // paired getter. plain property / method value: return the value annotation
            if (member.kind === 'get') {
              const got = functionTypeReturnAnnotation(unwrapTypeAnnotation(member.value));
              if (!got) break;
              return withMarkers(withSubst(got));
            }
            if (member.kind === 'set') break;
            return withMarkers(withSubst(member.value), member);
          case 'ClassProperty':         // flow, and babel TS `abstract` / `declare` fields
          case 'PropertyDefinition':    // babel TS / ESTree spec
          case 'TSAbstractPropertyDefinition': // oxc `abstract x: T` (babel keeps ClassProperty)
          case 'ClassAccessorProperty': // babel decoratorAutoAccessors plugin
          case 'AccessorProperty':      // TC39 stage-4 auto-accessor: oxc / ESTree spec
          case 'TSAbstractAccessorProperty': // oxc `abstract accessor x: T`
            // class body property: typeAnnotation if present, otherwise `break` so a sibling
            // iface-merge property with the annotation supplies the type (`class C { items=[] };
            // interface C { items: number[] }`). returning null here would halt iteration and
            // over-emit the generic Maybe polyfill family. keep parser-shape list in sync with
            // `createClassMemberShape.isPropertyMember` in `class-member-shapes.js`
            if (!member.computed && keyMatchesName(member.key, key) && member.typeAnnotation) {
              return withMarkers(withSubst(member.typeAnnotation), member);
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
            if (member.kind === 'get') {
              const got = member.returnType ?? member.value?.returnType;
              if (!got) break;
              return withMarkers(withSubst(got));
            }
            if (member.kind === 'set') break;
            return returnMemberMethodNode(member, subst);
        }
      }
      const indexSig = pickIndexSignature(members, key);
      if (indexSig) return withMarkers(withSubst(indexSig));
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
  }

  function reset() {
    getTypeMembersCache = new WeakMap();
  }

  return {
    arrayElementType,
    findTypeMember,
    getTypeMembers,
    reset,
  };
}
