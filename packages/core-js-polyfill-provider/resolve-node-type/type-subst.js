// Type-parameter substitution machinery, end-to-end. Consolidates two tightly-coupled
// sub-domains:
//
//   Alias chain walker - `followTypeAliasChain` walks `type A = B; type B = C; ...` accumulating
//     a Map<typeParamName, ASTNode> of substitutions through each generic hop. terminates on
//     the first non-alias / non-reference body. `swapAliasToTSTypeQueryWithSubst` is the
//     `TSTypeQuery`-aware variant used by `member-resolve` / `call-resolution`.
//
//   AST substitution - `applyAliasSubstDeep` walks an AST tree, splicing in subst values at
//     every `TSTypeReference` whose name appears in the subst Map. shape-preserving (same
//     node identity when nothing substituted) so callers can detect "no-op" via reference
//     equality. memoized per (node, subst) identity. `substMemberAnnotations` / `substMembers`
//     batch-apply over member arrays; `dropTypeParamSubst` is the alpha-rename guard for
//     signature-local `<T>`.
//
// The walker drives the chain follower (`followTypeAliasChain` invokes `applySubst` on the
// terminal node when a trivial mapped passthrough lands; with `as`-rename it folds the
// accumulated subst into the whole mapped type). Splitting them caused circular service
// deps in the factory; merging puts the two halves in the same closure.
//
// Public surface:
//   followTypeAliasChain(node, scope)          - alias chain walker; returns { node, subst }
//   swapAliasToTSTypeQueryWithSubst(ann, scope) - terminal TSTypeQuery + subst, or pass-through
//   applyAliasSubstDeep(node, subst, depth?, visited?) - core AST walker (cached + cycle-safe)
//   applySubst(node, subst)                     - predicate-style helper
//   substMemberAnnotations({ member, subst, depth?, visited? }) - clone member with subst
//   substMembers(members, subst)                - batch-apply over a member list
//   dropTypeParamSubst(typeParameters, subst)   - alpha-rename guard
//   reset()                                     - per-file cache invalidation
//
// Pure predicates (`isTypeAlias`, `typeAliasBody`, `typeRefName`) come from `ast-shapes`;
// imported directly because they're closure-free
import { MAX_DEPTH, MEMBER_ANNOTATION_SLOTS } from './base.js';
import { isTypeAlias, typeAliasBody, typeRefName } from './ast-shapes.js';
import { getTypeArgs } from '../helpers/ast-patterns.js';

export function createTypeSubst({
  unwrapTypeAnnotation,
  findTypeDeclaration,
  typeParamName,
  unwrapMappedTypePassthrough,
  tupleElements,
  rebuildTupleElements,
  mappedTypeKeyName,
  dropMapKeys,
  trueBranchSubst,
  functionTypeParams,
}) {
  // --- AST substitution ---

  // memoize `(node, subst)` -> result. without cache, deep-nested generic mapped passthroughs
  // (`type Step1<T> = { [K in keyof T]: T[K] }; type Step2<T> = Step1<{...}>; ...`) cause
  // exponential redundant walks because each recursion branches into the substitution value
  // (which contains TypeReferences that re-enter the walk). cycle guard `seen` Set is local
  // to TypeReference walks - doesn't dedup work across cousin branches. WeakMap on node
  // GC-clears with the AST; inner WeakMap on subst Map identity scopes per-walk. visited-aware
  // calls bypass cache (the visited Set restricts result vs unvisited)
  let applySubstCache = new WeakMap();

  // substitute type-param references through `followTypeAliasChain`'s subst map.
  // recurses into refs/args/arrays/tuples/unions so interface-extends args reach
  // inherited members after getTypeMembers flattens them. `visited` is the cycle-guard
  // Set built by TSTypeReference's self-ref protection - threading it through every
  // nested call short-circuits F-bounded shapes (`type A<T> = ContainerOf<T>` with
  // subst `{T: ContainerOf<T>}`) before depth exhaustion
  function substSlot(node, slot, subst, depth, visited) {
    const next = applyAliasSubstDeep(node[slot], subst, depth + 1, visited);
    return next === node[slot] ? node : { ...node, [slot]: next };
  }

  function substList(node, slot, subst, depth, visited) {
    const list = node[slot];
    if (!list?.length) return node;
    const next = list.map(el => applyAliasSubstDeep(el, subst, depth + 1, visited));
    return next.every((el, i) => el === list[i]) ? node : { ...node, [slot]: next };
  }

  // substList variant for tuple AST (TS uses `elementTypes`, Flow uses `types`) - probes
  // the right slot via `tupleElements` / `rebuildTupleElements` so the substitution path
  // doesn't duplicate the dialect dispatch
  function substTupleAlist(node, subst, depth, visited) {
    const elements = tupleElements(node);
    if (!elements?.length) return node;
    const next = elements.map(e => applyAliasSubstDeep(e, subst, depth + 1, visited));
    if (next.every((e, i) => e === elements[i])) return node;
    return rebuildTupleElements(node, (_, i) => next[i]);
  }

  // rebuild a reference-shape node with substituted typeArguments. `base` is the spread base;
  // when `base === node` (no substitute swap happened), preserves identity if all args
  // resolve to themselves so caller sees `===` against the input
  function withSubstitutedTypeArgs(node, base, subst, depth, visited) {
    const args = getTypeArgs(node);
    if (!args?.params?.length) return base;
    const next = args.params.map(p => applyAliasSubstDeep(p, subst, depth + 1, visited));
    if (base === node && next.every((p, i) => p === args.params[i])) return node;
    const argsKey = node.typeParameters ? 'typeParameters' : 'typeArguments';
    return { ...base, [argsKey]: { ...args, params: next } };
  }

  // expects an AST-subst map: `Map<string, ASTNode>` built by `buildSubstMap`.
  // values are AST nodes that get spliced into the cloned tree.
  // do NOT pass a Type-object-valued binding map (built by `resolveTypeArgs`) - the
  // recursion would treat resolved Type Objects as AST nodes and produce nonsense.
  // for Type-object-valued maps use `substituteTypeParams` instead
  function applyAliasSubstDeep(node, subst, depth = 0, visited = null) {
    if (depth > MAX_DEPTH || !subst || !node || typeof node !== 'object') return node;
    // cache miss: compute via inner switch, store result keyed by (node, subst). visited
    // walks (cycle guard active) skip cache - their result depends on caller's `seen` state
    if (visited) return applyAliasSubstDeepInner(node, subst, depth, visited);
    let perNode = applySubstCache.get(node);
    if (perNode) {
      const cached = perNode.get(subst);
      if (cached !== undefined) return cached;
    }
    const result = applyAliasSubstDeepInner(node, subst, depth, visited);
    if (!perNode) {
      perNode = new WeakMap();
      applySubstCache.set(node, perNode);
    }
    perNode.set(subst, result);
    return result;
  }

  function substTypeReference(node, subst, depth, visited) {
    const name = typeRefName(node);
    if (name && subst.has(name)) {
      const seen = visited ?? new Set();
      if (seen.has(name)) return node;
      seen.add(name);
      try {
        const replaced = applyAliasSubstDeep(subst.get(name), subst, depth + 1, seen);
        if (replaced?.type !== 'TSTypeReference' && replaced?.type !== 'GenericTypeAnnotation') return replaced;
        if (getTypeArgs(replaced)?.params?.length) return replaced;
        return withSubstitutedTypeArgs(node, replaced, subst, depth, seen);
      } finally {
        seen.delete(name);
      }
    }
    return withSubstitutedTypeArgs(node, node, subst, depth, visited);
  }

  function substTypeLiteral(node, subst, depth, visited) {
    if (!node.members) return node;
    let changed = false;
    const members = node.members.map(m => {
      const next = substMemberAnnotations({ member: m, subst, depth: depth + 1, visited });
      if (next !== m) changed = true;
      return next;
    });
    return changed ? { ...node, members } : node;
  }

  function substConditional(node, subst, depth, visited) {
    const ck = applyAliasSubstDeep(node.checkType, subst, depth + 1, visited);
    const localSubst = trueBranchSubst(node.extendsType, subst);
    const ex = applyAliasSubstDeep(node.extendsType, localSubst, depth + 1, visited);
    const tr = applyAliasSubstDeep(node.trueType, localSubst, depth + 1, visited);
    const fl = applyAliasSubstDeep(node.falseType, subst, depth + 1, visited);
    return ck === node.checkType && ex === node.extendsType && tr === node.trueType && fl === node.falseType
      ? node : { ...node, checkType: ck, extendsType: ex, trueType: tr, falseType: fl };
  }

  function substFunctionType(node, subst, depth, visited) {
    const returnSlot = node.returnType ? 'returnType' : 'typeAnnotation';
    const innerSubst = dropTypeParamSubst(node.typeParameters, subst);
    const rt = node[returnSlot] ? applyAliasSubstDeep(node[returnSlot], innerSubst, depth + 1, visited) : node[returnSlot];
    const paramsSlot = 'parameters' in node ? 'parameters' : 'params';
    const params = node[paramsSlot]?.map(p => {
      const pTA = p.typeAnnotation ? applyAliasSubstDeep(p.typeAnnotation, innerSubst, depth + 1, visited) : p.typeAnnotation;
      return pTA === p.typeAnnotation ? p : { ...p, typeAnnotation: pTA };
    });
    const paramsChanged = params && params.some((p, i) => p !== node[paramsSlot][i]);
    if (rt === node[returnSlot] && !paramsChanged) return node;
    return { ...node, [returnSlot]: rt, ...paramsChanged && { [paramsSlot]: params } };
  }

  // ESTree MethodDefinition wraps its function shape in .value (FunctionExpression). delegate
  // through applyAliasSubstDeep so the FunctionExpression handler below substitutes returnType
  // and params with proper alpha-rename. without this, `findTypeMember` returns the method
  // unchanged for ESTree-parsed sources, and indexed-access / class-chain peels lose the
  // outer type-param substitution by the time downstream functionTypeReturnAnnotation reads
  // the slots
  function substMethodDefinition(node, subst, depth, visited) {
    if (!node.value) return node;
    const newValue = applyAliasSubstDeep(node.value, subst, depth + 1, visited);
    return newValue === node.value ? node : { ...node, value: newValue };
  }

  function substIndexedAccess(node, subst, depth, visited) {
    const obj = applyAliasSubstDeep(node.objectType, subst, depth + 1, visited);
    const idx = applyAliasSubstDeep(node.indexType, subst, depth + 1, visited);
    return obj === node.objectType && idx === node.indexType
      ? node : { ...node, objectType: obj, indexType: idx };
  }

  function substMappedType(node, subst, depth, visited) {
    const tp = node.typeParameter;
    const innerName = mappedTypeKeyName(node);
    const innerSubst = innerName ? dropMapKeys(subst, new Set([innerName])) : subst;

    function recurseSlot(parent, slot, map) {
      return parent?.[slot]
        ? applyAliasSubstDeep(parent[slot], map, depth + 1, visited) : parent?.[slot];
    }

    const tpConstraint = recurseSlot(tp, 'constraint', subst);
    const flatConstraint = recurseSlot(node, 'constraint', subst);
    const ann = recurseSlot(node, 'typeAnnotation', innerSubst);
    const nameType = recurseSlot(node, 'nameType', innerSubst);
    if (tpConstraint === tp?.constraint && flatConstraint === node.constraint
      && ann === node.typeAnnotation && nameType === node.nameType) return node;
    return {
      ...node,
      typeParameter: tp ? { ...tp, constraint: tpConstraint } : tp,
      ...node.constraint !== undefined && { constraint: flatConstraint },
      typeAnnotation: ann,
      nameType,
    };
  }

  function substLiteralType(node, subst, depth, visited) {
    if (node.literal?.type !== 'TemplateLiteral') return node;
    const inner = substList(node.literal, 'expressions', subst, depth, visited);
    return inner === node.literal ? node : { ...node, literal: inner };
  }

  // dispatch table: 14 AST shapes routed to per-shape handlers. simple slot-substitution
  // cases (`substSlot` / `substList`) stay as inline arrow values; complex multi-slot
  // / alpha-rename cases live as named functions for readability and stack traces
  const SUBST_DISPATCH = {
    TSTypeReference: substTypeReference,
    GenericTypeAnnotation: substTypeReference,
    TSTypeAnnotation: (n, s, d, v) => substSlot(n, 'typeAnnotation', s, d, v),
    TypeAnnotation: (n, s, d, v) => substSlot(n, 'typeAnnotation', s, d, v),
    TSParenthesizedType: (n, s, d, v) => substSlot(n, 'typeAnnotation', s, d, v),
    TSOptionalType: (n, s, d, v) => substSlot(n, 'typeAnnotation', s, d, v),
    NullableTypeAnnotation: (n, s, d, v) => substSlot(n, 'typeAnnotation', s, d, v),
    TSTypeOperator: (n, s, d, v) => substSlot(n, 'typeAnnotation', s, d, v),
    TSRestType: (n, s, d, v) => substSlot(n, 'typeAnnotation', s, d, v),
    TSNamedTupleMember: (n, s, d, v) => substSlot(n, 'elementType', s, d, v),
    TSArrayType: (n, s, d, v) => substSlot(n, 'elementType', s, d, v),
    ArrayTypeAnnotation: (n, s, d, v) => substSlot(n, 'elementType', s, d, v),
    TSTupleType: substTupleAlist,
    TupleTypeAnnotation: substTupleAlist,
    TSUnionType: (n, s, d, v) => substList(n, 'types', s, d, v),
    UnionTypeAnnotation: (n, s, d, v) => substList(n, 'types', s, d, v),
    TSIntersectionType: (n, s, d, v) => substList(n, 'types', s, d, v),
    IntersectionTypeAnnotation: (n, s, d, v) => substList(n, 'types', s, d, v),
    TSTypeLiteral: substTypeLiteral,
    TSConditionalType: substConditional,
    TSFunctionType: substFunctionType,
    TSConstructorType: substFunctionType,
    FunctionTypeAnnotation: substFunctionType,
    // class-method shapes: babel ClassMethod / ClassPrivateMethod / TSDeclareMethod carry
    // returnType + params + typeParameters directly. shared with substFunctionType because
    // the slot layout matches. MethodDefinition peels into .value first (ESTree wrap);
    // FunctionExpression substitution covers the .value descent from substMemberAnnotations'
    // slot iteration. without these handlers, `returnMemberMethodNode(member, subst)` returns
    // method members unchanged - downstream class type-arg subst is silently lost for
    // findTypeMember consumers (e.g. T['method'] indexed-access resolution).
    // oxc emits a body-LESS method's `.value` as TSEmptyBodyFunctionExpression (a `declare class`
    // method or overload signature carries the returnType on `.value`, where babel's TSDeclareMethod
    // carries it on the node); without this entry the return-type subst is dropped on oxc only - a
    // babel-vs-unplugin divergence for the same `declare class C<T> { m(): T[] }` -> `C<X>['m']`.
    // an oxc `abstract m(): T[]` is a TSAbstractMethodDefinition with the same `.value` wrap as
    // MethodDefinition (babel uses TSDeclareMethod, already handled), so it routes the same way
    ClassMethod: substFunctionType,
    ClassPrivateMethod: substFunctionType,
    TSDeclareMethod: substFunctionType,
    FunctionExpression: substFunctionType,
    TSEmptyBodyFunctionExpression: substFunctionType,
    MethodDefinition: substMethodDefinition,
    TSAbstractMethodDefinition: substMethodDefinition,
    TSIndexedAccessType: substIndexedAccess,
    TSMappedType: substMappedType,
    TSTypeQuery: (n, s, d, v) => withSubstitutedTypeArgs(n, n, s, d, v),
    TSTemplateLiteralType: (n, s, d, v) => substList(n, 'types', s, d, v),
    TSLiteralType: substLiteralType,
  };

  function applyAliasSubstDeepInner(node, subst, depth, visited) {
    const handler = SUBST_DISPATCH[node.type];
    return handler ? handler(node, subst, depth, visited) : node;
  }

  // small predicate-style helper for the `subst ? applyAliasSubstDeep(node, subst) : node`
  // idiom that appears across alias-chain consumers. extracting keeps the conditional out
  // of expression-tail position where it nests awkwardly inside `?:`, `??`, and ternary
  // arguments. no behavioural change - identical to the inlined branch
  function applySubst(node, subst) {
    return subst ? applyAliasSubstDeep(node, subst) : node;
  }

  // clone member with deep-substituted annotation slots; `key`/`computed` stay as-is.
  // covers TS `TSPropertySignature`/`TSIndexSignature`/`TSMethodSignature` and Flow
  // `ObjectTypeProperty`. depth / visited are forwarded to `applyAliasSubstDeep` so callers
  // inside cycle-active walks don't reset the cycle guard - `applyAliasSubstDeepInner`'s
  // TSTypeLiteral case routes through here to avoid duplicating the slot-iteration pattern
  function substMemberAnnotations({ member, subst, depth = 0, visited = null }) {
    if (!member || typeof member !== 'object') return member;
    // a method-like member's signature-local typeParameters (`bar<T>(): T`) shadow the outer subst.
    // for the return / value annotation, remap them to `unknown` (not just drop): a dropped `T`
    // stays a bare reference that the downstream resolver re-binds to the receiver's concrete arg
    // via scope lookup, mis-narrowing the unconstrained return; `unknown` keeps it generic.
    // identity-preserving for non-generic members so property / index signatures are unaffected
    const returnSubst = shadowMethodTypeParams(member.typeParameters, subst);
    let cloned = null;
    for (const slot of MEMBER_ANNOTATION_SLOTS) {
      if (!member[slot]) continue;
      const next = applyAliasSubstDeep(member[slot], returnSubst, depth, visited);
      if (next === member[slot]) continue;
      cloned ??= { ...member };
      cloned[slot] = next;
    }
    // method-like members carry params; signature-local typeParameters shadow outer subst.
    // walk each param's typeAnnotation via shared `dropTypeParamSubst` alpha-rename guard.
    // babel quirk (same as TSFunctionType): TSMethodSignature uses `parameters`; ClassMethod
    // uses `params`. probe whichever slot the node carries via `functionTypeParams`. without
    // this, methods with parameter types referring to outer alias type-params bail on
    // overload resolution AND interface-shaped Thenable detection (`peelUserThenable`) fails
    // to substitute T inside `then(cb: (v: T) => ...)`
    const memberParamsList = functionTypeParams(member);
    if (Array.isArray(memberParamsList) && memberParamsList.length) {
      const innerSubst = dropTypeParamSubst(member.typeParameters, subst);
      let paramsChanged = false;
      const nextParams = memberParamsList.map(p => {
        if (!p?.typeAnnotation) return p;
        const next = applyAliasSubstDeep(p.typeAnnotation, innerSubst, depth, visited);
        if (next === p.typeAnnotation) return p;
        paramsChanged = true;
        return { ...p, typeAnnotation: next };
      });
      if (paramsChanged) {
        const slot = 'parameters' in member ? 'parameters' : 'params';
        cloned ??= { ...member };
        cloned[slot] = nextParams;
      }
    }
    return cloned ?? member;
  }

  // batch-apply subst to every member; passes through unchanged when subst is empty / null
  // or members list is null. shared between every collector / resolver that needs per-source
  // substitution (class chain, interface merging, parent extends, type alias body)
  function substMembers(members, subst) {
    return members && subst ? members.map(m => substMemberAnnotations({ member: m, subst })) : members;
  }

  // alpha-rename clone for signature-local `<T>` typeParameters. shared between TSFunctionType
  // / TSConstructorType / FunctionTypeAnnotation case in `applyAliasSubstDeep` and
  // TSMethodSignature path in `substMemberAnnotations`. inner names listed in `typeParameters`
  // shadow outer subst entries of the same name; identity-preserving when no collision so
  // memoize keys remain stable
  // a signature's own type-parameter names (`<T, U>`), filtered to plain string identifiers
  function signatureTypeParamNames(typeParameters) {
    return typeParameters?.params?.map(typeParamName).filter(n => typeof n === 'string');
  }

  function dropTypeParamSubst(typeParameters, subst) {
    const innerNames = signatureTypeParamNames(typeParameters);
    return innerNames?.length ? dropMapKeys(subst, new Set(innerNames)) : subst;
  }

  // like `dropTypeParamSubst`, but for a return / value annotation: remaps each signature-local
  // `<T>` to `unknown` instead of dropping it. a bare dropped `T` re-binds to the receiver's
  // concrete arg via the downstream scope lookup (`o.bar()` on `C<string>` narrows the
  // unconstrained `bar<T>(): T` return to string); remapping to `unknown` keeps it generic.
  // identity-preserving when the signature declares no own type-params
  function shadowMethodTypeParams(typeParameters, subst) {
    const innerNames = signatureTypeParamNames(typeParameters);
    if (!innerNames?.length) return subst;
    // `new Map(null)` yields an empty map, so this handles both a null outer subst and a Map
    const out = new Map(subst);
    for (const name of innerNames) out.set(name, { type: 'TSUnknownKeyword' });
    return out;
  }

  function reset() {
    applySubstCache = new WeakMap();
  }

  // --- Alias chain walker ---

  // follow type alias chain: type A = type B = ... until non-alias or non-reference found
  // returns { node, subst } where subst is a Map<string, ASTNode> of accumulated type parameter
  // substitutions through the chain, or null if no generic aliases were traversed
  function followTypeAliasChain(node, scope) {
    let depth = MAX_DEPTH;
    let subst = null;
    // bail on cycle (`type A = B; type B = A;`) before depth exhausts and subst balloons
    const visited = new Set();
    node = unwrapTypeAnnotation(node);
    while (depth-- && (node?.type === 'TSTypeReference' || node?.type === 'GenericTypeAnnotation')) {
      const refName = typeRefName(node);
      if (!refName) break;
      const decl = findTypeDeclaration(refName, scope);
      if (!isTypeAlias(decl)) {
        // HKT splice for user-defined F: `type Wrap<F,X> = F<X>` applied as `Wrap<Boxed,...>`.
        // findTypeDeclaration misses F (it's a typeparam binding, not a top-level decl), so
        // rewrite the ref through subst and re-enter the loop on Boxed's actual declaration.
        // built-in F (Array, Promise, ...) takes a separate Type-object path via
        // applyHigherKindedArgs - no AST body to walk, container identity is the result
        if (subst?.has(refName)) {
          const spliced = applyAliasSubstDeep(node, subst);
          // identity check guards against subst that resolves F to itself (cycle);
          // depth++ reclaims the iteration consumed by the unproductive lookup
          if (spliced && spliced !== node
            && (spliced.type === 'TSTypeReference' || spliced.type === 'GenericTypeAnnotation')) {
            depth++;
            node = unwrapTypeAnnotation(spliced);
            continue;
          }
        }
        break;
      }
      if (visited.has(decl)) break;
      visited.add(decl);
      // accumulate type parameter substitutions for generic aliases
      const declParams = decl.typeParameters?.params;
      const usageArgs = getTypeArgs(node)?.params;
      if (declParams?.length) {
        const newSubst = new Map(subst);
        for (let i = 0; i < declParams.length; i++) {
          let arg = usageArgs?.[i] ?? declParams[i].default;
          if (!arg) continue;
          // resolve through existing substitutions for chained generic aliases:
          // type A<T> = B<T>; type B<U> = [U, U]; -> A<string> needs U -> T -> string
          if (subst) {
            const argName = typeRefName(arg);
            if (argName && subst.has(argName)) arg = subst.get(argName);
          }
          newSubst.set(typeParamName(declParams[i]), arg);
        }
        subst = newSubst;
      }
      node = unwrapTypeAnnotation(typeAliasBody(decl));
    }
    // unwrap a final-step trivial mapped passthrough so `Copy<T> = { [K in keyof T]: T[K] }`
    // resolves through to T (substituted) instead of stopping at the mapped type. for
    // `as`-rename mapped types we can't passthrough, but downstream `expandMappedTypeMembers`
    // needs the source type concrete (`keyof T` enumeration requires T's literal members);
    // fold accumulated subst into the whole node so the rename expansion runs on the
    // post-substitution mapped type
    if (node?.type === 'TSMappedType') {
      const passthrough = unwrapMappedTypePassthrough(node);
      if (passthrough) node = unwrapTypeAnnotation(applySubst(passthrough, subst));
      else if (subst) node = applyAliasSubstDeep(node, subst);
    }
    return { node, subst };
  }

  // generic alias chain ending in TSTypeQuery (`type Q<T> = typeof fn<T>`, `type Q = typeof X`).
  // returns the post-swap annotation with alias subst applied to the TSTypeQuery, or the
  // input unchanged when the chain doesn't terminate in TSTypeQuery. shared by
  // `resolveTypedMember` (member-access dispatch) and `resolveCallReturnTypeFromAnnotation`
  // (call-return dispatch) - both need the post-alias TSTypeQuery to enter the typeof
  // branch with concrete instantiation typeParameters
  function swapAliasToTSTypeQueryWithSubst(annotation, scope) {
    if (!annotation) return annotation;
    const aliased = followTypeAliasChain(annotation, scope);
    if (aliased?.node?.type !== 'TSTypeQuery' || aliased.node === annotation) return annotation;
    return aliased.subst ? applyAliasSubstDeep(aliased.node, aliased.subst) : aliased.node;
  }

  return {
    followTypeAliasChain,
    swapAliasToTSTypeQueryWithSubst,
    applyAliasSubstDeep,
    applySubst,
    substMemberAnnotations,
    substMembers,
    dropTypeParamSubst,
    shadowMethodTypeParams,
    reset,
  };
}
