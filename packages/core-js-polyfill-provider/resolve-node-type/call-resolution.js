// Call-expression return type + expression annotation resolution. consolidates two tightly
// coupled walkers:
//   - call-return: dispatches `foo()` / `obj.method()` / aliased static / typeof-binding calls
//     to a return type. handles four callee shapes (method / direct / indirect / static alias /
//     typeof-binding) and bottoms out via `resolveCallReturnTypeFromAnnotation` when runtime
//     resolution fails (cast-on-callee `(fn as () => T)()`, `declare const f: () => T`, ...)
//   - expression-annotation: finds the raw TS / Flow annotation of an arbitrary expression
//     path. peels TS wrappers (TSAsExpression / TSSatisfiesExpression / TSTypeAssertion /
//     TSNonNullExpression / TSInstantiationExpression / TypeCastExpression /
//     ParenthesizedExpression / ChainExpression), follows Identifier bindings through const
//     chains, resolves MemberExpressions through the object's annotation, and walks Call /
//     OptionalCall callees to their declared return annotation with call-site type-arg subst
//
// kept in one cluster because the two walkers cross-reference each other:
// `findExpressionAnnotation` consults `functionTypeReturnAnnotation` on call-callee
// annotations; `resolveCallReturnTypeFromAnnotation` consults `findExpressionAnnotation` on
// the callee path. co-location avoids forward-decl thunks between the two walkers.
//
// Public surface:
//   resolveCallReturnType(callee)                     - main call-return entry
//   functionTypeReturnAnnotation(node)                - cross-dialect return-slot extractor
//   shadowedAliasReturnAnnotation(arg, scope)         - `ReturnType<Fn alias>` shadow resolver
//   findExpressionAnnotation(path, depth?)            - { annotation, scope, path } | null
//     `path` is the DECLARATION the annotation was written on, so a consumer can resolve the names
//     inside it where they were written rather than where the value is used
//   resolveIndexSignatureValue(typeNode, scope, subst) - TSIndexSignature member resolution
//   indexAccessKeyKind(memberPath)                    - computed-key kind classifier
//   buildCallSiteSubst(fnNode, callNode)              - explicit `<...>` args -> subst Map
//   resetExpressionAnnotationCache()                  - per-file cache drop
//
// `staticPairFromPolyfillEntry` stays in the factory because it's consumed by the
// binding-analysis cluster instantiated upstream (factory function declaration is hoisted;
// moving it here would force a cluster-instantiation-order rework)
import { walkStaticReceiverChain } from '../detect-usage/destructure.js';
import { MAX_DEPTH, $Object, callArgumentPaths, canonicalArrayIndex, dropLeadingThisParam } from './base.js';
import {
  collectQualifiedSegments,
  discriminateOverloads,
  isObjectTypeLiteral,
  isTypeReferenceNode,
  isUnionType,
  peelTSParenthesized,
  unionAnnotationOf,
  typeRefName,
  TS_NUMBER_TYPE,
  TS_UNKNOWN_TYPE,
} from './ast-shapes.js';
import { isAmbientFunctionNode } from './name-resolution.js';
import {
  cleanDestructureAliasWrites, getCallSiteTypeArgs, getTypeArgs, isCleanDestructureAliasBinding,
  isGuardedAliasingWrite,
} from '../helpers/ast-patterns.js';

const { hasOwn } = Object;

// the annotation shapes that describe `new X()` - the only ones whose return is an INSTANCE type
const CONSTRUCT_SIGNATURE_TYPES = new Set(['TSConstructorType', 'TSConstructSignatureDeclaration']);

export function createCallResolution({
  t,
  babelNodeType,
  getScopeBinding,
  babelBindingAdapter,
  isMemberLike,
  isMutatedStatic = () => false,
  isFunctionLike,
  isNullableOrNever,
  commonType,
  foldUnionArmTypes,
  hasParamTypeRef = null,
  resolveNodeType,
  resolveRuntimeExpression,
  resolveReturnType,
  withLookupPath,
  findPatternKeyPath,
  annotationAtKeyPath,
  findTupleElement,
  arrayElementType,
  foldOverloadReturns,
  findAmbientFunctionPaths,
  findOverloadsForName,
  resolveFromMemberExpression,
  resolveKnownStaticReturnType,
  resolveStaticReturnFromHint,
  resolveKnownInstanceMember,
  KNOWN_INSTANCE_METHOD_RETURN_TYPES,
  staticPairFromPolyfillEntry,
  lookupNested,
  KNOWN_STATIC_METHOD_RETURN_TYPES,
  findDestructuredKeyPath,
  swapAliasToTSTypeQueryWithSubst,
  resolveReturnTypeFromTypeQuery,
  resolveTypeAnnotation,
  unwrapTypeAnnotation,
  resolveMemberPropertyName,
  followTypeAliasChain,
  applySubst,
  shadowMethodTypeParams,
  applyAliasSubstDeep,
  isNullableOrNeverAnnotation,
  getTypeMembers,
  keyMatchesName,
  findBindingAnnotation,
  narrowUnionByAssignmentLiteral,
  buildSubstMap,
  typeParamName,
  effectiveParam,
  resolveIndexedAccessMemberAnnotationAST,
}) {
  // --- Call-return dispatch ---

  function resolveMemberCallType(memberPath, callPath) {
    return resolveFromMemberExpression(memberPath, callPath)
      || resolveKnownStaticReturnType(memberPath, callPath)
      || resolveKnownInstanceMember(memberPath, KNOWN_INSTANCE_METHOD_RETURN_TYPES, callPath);
  }

  // ES construct semantics: a constructor's PRIMITIVE return is DISCARDED and the fresh object
  // stands in its place. every RUNTIME lane below answers "what does the call return", so under
  // `new` each of them has to be read that way - reading it off the resolved callee's node SHAPE
  // instead let an ambient declaration and a member call-signature past the rule
  function discardPrimitiveConstruct(type, signatureKind) {
    return signatureKind === 'construct' && type?.primitive ? new $Object('Object') : type;
  }

  function resolveCallReturnType(callee, signatureKind = 'call') {
    const runtime = resolveRuntimeCallReturnType(callee);
    // the annotation lane is exempt on purpose: `new () => T` DECLARES the instance type, so its
    // answer is the declaration's and not a return value to discard. `undefined` is this file's
    // own "no answer here, keep looking" - no runtime lane produces it
    return runtime === undefined
      ? resolveCallReturnTypeFromAnnotation(callee, signatureKind)
      : discardPrimitiveConstruct(runtime, signatureKind);
  }

  // no lane here reads the signature kind - each answers what the CALL returns, and reading that
  // answer under construct semantics is the caller's single step above
  function resolveRuntimeCallReturnType(callee) {
    // method call: obj.method() or obj?.method()
    if (isMemberLike(callee)) {
      // receiver is statically undefined/null/never -> chain is broken at runtime; propagate
      // the same to downstream so `fn(){}; fn().at(0).includes(1)` doesn't half-polyfill
      const receiverType = resolveNodeType(callee.get('object'));
      if (receiverType && isNullableOrNever(receiverType)) return receiverType;
      return resolveMemberCallType(callee, callee.parentPath);
    }
    // direct call: foo() / IIFE: (() => expr)() / ambient TSDeclareFunction follow-through
    const resolved = resolveRuntimeExpression(callee);
    if (isFunctionLike(resolved.node)) {
      // an overload SET answers before the node the name resolves to. TS makes the heads the only
      // callable signatures and the implementation uncallable, so a direct call takes the FIRST head
      // whose params match the arguments - the implementation's own return never participates.
      // asking `isAmbientFunctionNode(resolved.node)` first skipped exactly the concrete set: an
      // all-ambient set resolves the name to a head, but `function f(a): A; function f(b): B;
      // function f(x) {...}` resolves it to the IMPLEMENTATION, so the fold never ran and the
      // implementation answered alone. the head lookup is already scope-correct for both - heads
      // declared beside the implementation are not "shadowed by value" (same scope), while an
      // unrelated ambient of the same name in an OUTER scope still is. a set with no heads returns
      // `undefined` here and falls through to the implementation, which is the whole non-overload world
      const headName = resolved.node.id?.name;
      const ambient = headName
        ? resolveAmbientFunctionReturn(headName, resolved.scope ?? callee.scope, callee.parentPath) : undefined;
      if (ambient !== undefined) return foldHeadAgainstImplementation(ambient, resolved, callee);
      return resolveReturnType(resolved, callee.parentPath);
    }
    // indirect call: const fn = obj.method; fn() - resolve through the stored member reference
    if (isMemberLike(resolved)) return resolveMemberCallType(resolved, callee.parentPath);
    // aliased static-method call. probe callee user-facing name first (injector alias
    // covers post-rewrite `const from = _Array$from` / destructure / default-with-fallback
    // shapes), then walked-resolved Identifier as fallback when alias-map missed
    if (t.isIdentifier(callee.node)) {
      const aliased = resolveAliasedStaticReturn(callee, callee.parentPath);
      if (aliased) return aliased;
    }
    if (resolved.node?.type === 'Identifier' && resolved.node !== callee.node) {
      const aliased = resolveAliasedStaticReturn(resolved, callee.parentPath);
      if (aliased) return aliased;
    }
    // ambient `declare function` (not in scope.bindings) keyed by Identifier name. cast-on-
    // callee shapes (`(fn as () => T)()`, `fn!()`) hit `findExpressionAnnotation` below
    if (t.isIdentifier(callee.node)) {
      const ambient = resolveAmbientFunctionReturn(callee.node.name, callee.scope, callee.parentPath);
      if (ambient !== undefined) return ambient;
    }
    // chained alias `const f = getArr; f()`: ambient probe by callee name 'f' missed; retry
    // against walked Identifier so the ambient return type reaches downstream member chains
    if (resolved.node?.type === 'Identifier' && resolved.node !== callee.node) {
      const ambient = resolveAmbientFunctionReturn(resolved.node.name, resolved.scope, callee.parentPath);
      if (ambient !== undefined) return ambient;
    }
    return undefined;
  }

  // ambient `declare function` overloads are arg-discriminated like interface method overloads, so the call
  // return resolves through the shared `foldOverloadReturns`: arg-match one overload, else WIDEN the divergent
  // set to generic rather than hand back one arm's type-specific Maybe (ie:11 throw on a foreign return).
  // `undefined` -> not an ambient function (caller falls through); `null` -> ambient but generic
  // TS keeps an ambient function's params and return ON the declaration; Flow keeps the whole
  // signature on the declared id's annotation instead. one accessor so the param reader and the
  // return reader below cannot end up asking about different nodes
  function ambientSignatureNode(node) {
    if (node?.type !== 'DeclareFunction') return node;
    return unwrapTypeAnnotation(node.id?.typeAnnotation) ?? node;
  }

  // an overload HEAD describes one arm; the implementation describes them all. where the two
  // disagree the call may produce either, so the answer is their common type - and a head that
  // an `any` implementation cannot corroborate is not a narrowing this layer may keep
  function foldHeadAgainstImplementation(headType, implPath, callee) {
    if (!headType || isAmbientFunctionNode(implPath.node)) return headType;
    const own = resolveReturnType(implPath, callee.parentPath);
    return own && !commonType(headType, own) ? null : headType;
  }

  function resolveAmbientFunctionReturn(name, scope, callPath) {
    const paths = findAmbientFunctionPaths(name, scope);
    if (!paths.length) return undefined;
    // `resolveReturnType` reads the declaration's own `returnType`, which the Flow spelling does not
    // have - fall back to resolving the signature's return annotation directly for that shape
    // each head resolves its return under ITS OWN declaration path: the annotation was written
    // there, so the type names in it belong to that container - anchoring on the call site instead
    // hands a `declare function` written outside a namespace the namesake declared inside it
    return foldOverloadReturns(paths, p => ambientSignatureNode(p.node).params,
      p => withLookupPath(p, () => resolveReturnType(p, callPath)
        ?? resolveTypeAnnotation(unwrapTypeAnnotation(ambientSignatureNode(p.node).returnType), p.scope)),
      p => ambientSignatureNode(p.node).returnType, callPath);
  }

  // resolve aliased static-method call return type. tries each alias shape's extractor
  // until one yields a (constructor, method) pair, then runs the shared registry lookup.
  // both extractors return null for non-matching shapes so the caller order doesn't
  // matter for correctness - polyfilled-entry first only because it's the cheaper probe
  function resolveAliasedStaticReturn(callee, callPath) {
    const pair = staticPairFromPolyfillEntry(callee.scope, callee.node.name)
      ?? staticPairFromDestructure(callee.scope, callee.node.name, callee);
    if (!pair) return null;
    // aliased patched static (`const af = Array.from` after `Array.from = ...`) - same drop to generic
    if (isMutatedStatic(pair.constructor, pair.method)) return null;
    const retHint = lookupNested(KNOWN_STATIC_METHOD_RETURN_TYPES, pair.constructor, pair.method);
    // delegate to the shared hint resolver so an aliased `freeze(a)` honors `returnsArgument` /
    // Promise.resolve arg-inference exactly like the direct `Object.freeze(a)` - not just the
    // declared hint, which would drop the array narrow to the generic 'Object'
    return retHint ? resolveStaticReturnFromHint({ hint: retHint, callPath }) : null;
  }

  // resolve `const { from } = Array` / nested `const { a: { from } } = wrapper` patterns
  // to a (constructor, method) pair. `findDestructuredKeyPath` peels shorthand / rename /
  // AssignmentPattern wrappers; init walk delegated to `walkStaticReceiverChain`.
  // reassigned bindings bail (current value may differ from pattern-init), except the
  // single-violation `let x; ({x} = Source)` shape which routes to `pairFromAssignmentDestructure`
  function staticPairFromDestructure(scope, name, path = null) {
    const binding = getScopeBinding(scope, name, path);
    if (!binding?.path) return null;
    // a conditionally-executed aliasing write assigns on one path only - the SAME poison the
    // injector's body-extract route applies at registration. without this bail the value-flow
    // route narrows a call result the untaken path never produces (benign - the call throws
    // there first) and the emitters diverge: babel's post-rewrite scope loses the pattern
    // while the pristine estree walk still resolves it, so only unplugin narrowed
    if (isGuardedAliasingWrite(binding)) return null;
    if (binding.constantViolations?.length) {
      // same clean-alias gate the injector's `registerBodyExtractAlias` applies, so the value-flow
      // route and the alias-entry route agree on which assignment-destructures resolve to a static
      if (!isCleanDestructureAliasBinding(binding)) return null;
      // normalize the violation up to its enclosing AssignmentExpression: babel reports the AE
      // itself, but estree-toolkit reports the LHS Identifier (walk up Property / ObjectPattern).
      // without this the assignment-destructure aliased-static return resolves on babel but null
      // on unplugin - asymmetric injection for identical source
      // through the SAME filtered set the gate above counted: a raw `constantViolations[0]` can be
      // a valueless re-declaration / self-violation the gate deliberately excluded, and pairing off
      // that phantom resolves the alias against an assignment that never happened
      const [write] = cleanDestructureAliasWrites(binding);
      const assignment = write && violationToAssignment(write);
      return assignment ? pairFromAssignmentDestructure(assignment, name, binding.scope) : null;
    }
    return pairFromDeclaratorDestructure(binding, name);
  }

  // walk a constant-violation NodePath up to its enclosing AssignmentExpression (babel: the
  // violation already IS the AE; estree: it is the LHS Identifier nested in Property/ObjectPattern)
  function violationToAssignment(violation) {
    let p = violation;
    for (let i = 0; i < MAX_DEPTH && p; i++) {
      const type = babelNodeType(p.node);
      if (type === 'AssignmentExpression') return p;
      if (type === 'ExpressionStatement' || type === 'Program') return null;
      p = p.parentPath;
    }
    return null;
  }

  function pairFromDeclaratorDestructure(binding, name) {
    let declarator = binding.path;
    while (declarator && !t.isVariableDeclarator(declarator.node)) declarator = declarator.parentPath;
    if (!declarator) return null;
    const { id, init } = declarator.node;
    if (id?.type !== 'ObjectPattern' || !init) return null;
    return pairFromPatternAndSource({ pattern: id, source: init, name, scope: declarator.scope, path: declarator });
  }

  // `let x; ({x} = Source)` style: violationPath is the AssignmentExpression containing
  // the destructure pattern. only `=` operator counts (`x ??= ...` / `x ||= ...` would
  // narrow only when Source matches the operator's discharge condition - skip for safety)
  function pairFromAssignmentDestructure(violationPath, name, scope) {
    const node = violationPath?.node;
    if (node?.type !== 'AssignmentExpression' || node.operator !== '=') return null;
    if (node.left?.type !== 'ObjectPattern' || !node.right) return null;
    return pairFromPatternAndSource({ pattern: node.left, source: node.right, name, scope, path: violationPath });
  }

  function pairFromPatternAndSource({ pattern, source, name, scope, path = null }) {
    const keyPath = findDestructuredKeyPath(pattern, name, scope);
    if (!keyPath?.length) return null;
    // thread the anchor `path` so the estree adapter resolves a function-scope-hoisted var
    // source (`if (c) { var G = Array } const { from } = G`) the same way babel does; without
    // it the static-receiver walk loses the source binding and the narrow diverges
    const constructor = walkStaticReceiverChain({
      receiverNode: source, walkPath: keyPath.slice(0, -1), scope, adapter: babelBindingAdapter, path,
    });
    if (!constructor || !hasOwn(KNOWN_STATIC_METHOD_RETURN_TYPES, constructor)) return null;
    return { constructor, method: keyPath.at(-1) };
  }

  // BOTH slots below are load-bearing, do not prune either. babel@8 and oxc put the return type on
  // `.returnType` for every kind here; babel@7 - still a supported leg - puts it on `.typeAnnotation`
  // for the SIGNATURE kinds (function / constructor type, method / call / construct signature) and on
  // `.returnType` only for the declaration kinds (declare method, class method). the order between
  // them does not matter: no parser populates both.
  // ESTree MethodDefinition and its abstract sibling TSAbstractMethodDefinition wrap the function
  // in `.value` so the return type lives one level deeper (oxc emits `abstract m(): T` as the
  // latter). consumers (e.g. ReturnType<typeof X.method>) call into this when `findTypeMember`
  // returns the raw signature instead of a synthetic stub. call / construct signatures peeled out
  // of an object type (`{ (): T }` / `{ new (): T }`) by the caller also land on the sig-node arm
  function functionTypeReturnAnnotation(node) {
    if (!node) return null;
    switch (node.type) {
      case 'TSFunctionType':
      case 'TSConstructorType':
      case 'TSMethodSignature':
      case 'TSDeclareMethod':
      case 'ClassMethod':
      case 'ClassPrivateMethod':
      case 'TSCallSignatureDeclaration':
      case 'TSConstructSignatureDeclaration':
        return node.typeAnnotation ?? node.returnType;
      case 'MethodDefinition':
      case 'TSAbstractMethodDefinition':
        return node.value?.returnType ?? node.value?.typeAnnotation;
      case 'FunctionTypeAnnotation':
        return node.returnType;
      default:
        return null;
    }
  }

  // `ReturnType<Fn alias>` (the non-typeof form): follow the alias chain, extract the function's return,
  // and shadow its signature-local `<T>` so the alias subst can't capture the unconstrained return into
  // `T`'s concrete arg, then apply the subst. shared by the `ReturnType` case in type-annotation resolution
  // and its mirror branch in `getTypeMembers` - keeping the shadow structural (in ONE place) so neither
  // consumer can drift back to capturing the method's own type-params
  function shadowedAliasReturnAnnotation(arg, scope) {
    const { node: aliased, subst } = followTypeAliasChain(unwrapTypeAnnotation(arg), scope);
    const fnType = unwrapTypeAnnotation(aliased);
    const ret = functionTypeReturnAnnotation(fnType);
    return ret ? applySubst(ret, shadowMethodTypeParams(fnType?.typeParameters, subst)) : null;
  }

  // extract return type from a binding's function-type annotation:
  //   `declare const f: () => T` / `const f: (x: X) => T = ...` / Flow `(x: X) => T` /
  //   `const f: typeof other` (follow TSTypeQuery to referenced function's return) /
  //   `type M = T['method']; declare const f: M` (peel TSIndexedAccessType to method node)
  function resolveCallReturnTypeFromAnnotation(callee, signatureKind = 'call') {
    const info = findExpressionAnnotation(callee);
    if (!info) return null;
    let annotation = unwrapTypeAnnotation(info.annotation);
    if (!annotation) return null;
    // follow alias chain to TSTypeQuery: `type Q<T> = typeof fn<T>` (TS 4.7+ instantiation
    // wrapped in generic alias). without the swap, downstream `functionTypeReturnAnnotation`
    // treats Q<...> as a TSTypeReference and returns null
    annotation = swapAliasToTSTypeQueryWithSubst(annotation, info.scope);
    if (annotation?.type === 'TSTypeQuery') {
      // a CALL through an aliased `typeof fn` arg-discriminates the overload set like a
      // direct call (shared fold); the type-level rightmost-overload rule (`ReturnType<
      // typeof fn>`) stays on resolveReturnTypeFromTypeQuery for everything else.
      // the segments channel serves bare AND qualified names (`typeof NS.fn`) alike -
      // gating on bare Identifiers dropped the qualified set here, mis-resolving the call
      // to the rightmost overload with the args ignored
      const segments = collectQualifiedSegments(annotation.exprName);
      const overloads = segments ? findOverloadsForName(segments, info.scope) : [];
      if (overloads.length >= 2) {
        return foldOverloadReturns(overloads, o => o.node.params,
          o => resolveReturnType(o, callee.parentPath), o => o.node.returnType, callee.parentPath);
      }
      return resolveReturnTypeFromTypeQuery(annotation, info.scope);
    }
    // TSIndexedAccessType callee annotation (`T['method']` directly OR via alias `type M =
    // T['method']`). follow the alias chain to surface the indexed-access body, then peel
    // through findTypeMember. method-shape detection (Layer 2) returns the full signature,
    // not just its return, so functionTypeReturnAnnotation below extracts the substituted
    // return slot. without the peel, indexed-access aliases bypass call narrowing entirely
    // follow the alias chain (carrying generic subst) BEFORE extracting the return, so a fn-type
    // alias (`type F = () => number[]`) or generic one (`type Mk<T> = () => T[]; f: Mk<number>`)
    // surfaces its TSFunctionType - the bare TSTypeReference is not a function-type node, so
    // `functionTypeReturnAnnotation` would bail to the generic helper. an indexed-access alias still
    // peels through `findTypeMember` first; a non-function alias yields null (generic), as before
    const aliased = followTypeAliasChain(annotation, info.scope);
    let target = aliased.subst ? applyAliasSubstDeep(aliased.node, aliased.subst) : aliased.node;
    if (target?.type === 'TSIndexedAccessType' || target?.type === 'IndexedAccessType') {
      const peeled = resolveIndexedAccessMemberAnnotationAST(target, info.scope, 0);
      if (peeled) target = peeled;
    }
    // a UNION callee IS one of its arms and nothing here says which, so every arm's return goes
    // through the shared alternatives fold
    return foldUnionArmTypes(target, returnOfCallableTarget);

    // the return TYPE of a single (non-union) callable annotation, resolved in the callee's scope
    function returnOfCallableTarget(callable) {
      let ret = functionTypeReturnAnnotation(callable);
      // a callable / constructable object type or interface (`{ (): T }` / `interface C { new (): T }`)
      // carries its signature as a member, not a bare function-type node. resolve the type's members
      // (getTypeMembers handles inline literals, interface merge / extends, and generic-arg subst) and
      // peel the signature matching the context - a CALL narrows through the call signature, a `new`
      // through the construct signature, so the two never cross-resolve (`new` on a call-only type
      // stays unresolved instead of narrowing to the call return)
      if (!ret) {
        const sigType = signatureKind === 'construct' ? 'TSConstructSignatureDeclaration' : 'TSCallSignatureDeclaration';
        const sigs = (getTypeMembers({ objectType: callable, scope: info.scope }) ?? []).filter(m => m.type === sigType);
        // an OVERLOADED signature set arg-discriminates one arm or widens through the shared
        // fold - picking last narrowed a divergent set to the wrong arm's type-specific Maybe
        // (`(x: number): number[]; (x: string): string` called with 5 must resolve number[])
        if (sigs.length >= 2) {
          return foldOverloadReturns(sigs, m => m.parameters ?? m.params, m => {
            const r = functionTypeReturnAnnotation(m);
            return r ? resolveTypeAnnotation(r, info.scope) : null;
          }, m => functionTypeReturnAnnotation(m), callee.parentPath);
        }
        if (sigs.length === 1) ret = functionTypeReturnAnnotation(sigs[0]);
      }
      return ret ? resolveTypeAnnotation(ret, info.scope) : null;
    }
  }

  // --- Expression annotation walker ---

  // resolve obj.prop annotation by chaining through the object's type, applying generic subst.
  // unions like `Foo | null` peel null/undefined/never branches and resolve member in the
  // first remaining branch (mirrors the `member-resolve` cluster's union handling); without
  // this peel, deep optional chains `arr?.b.c.includes(1)` lose receiver type narrowing past
  // the second hop because `arr` annotation `{b:...}|null` makes `getTypeMembers` bail.
  // computed access without statically-known name (`obj[k]` where k isn't a literal) falls
  // back to TSIndexSignature lookup via `resolveIndexSignatureValue`
  // do the union's per-branch member results agree? by SHAPE, one question for every branch kind.
  // a value-typed fold cannot be the first answer here: a structural hop (an object literal /
  // interface) resolves to a bare `Object`, so two DIVERGING hops (`{ rows: number[] }` and
  // `{ rows: string }`) fold to a common `Object` and read as agreement - the chain then continues
  // through the first branch and hands its type-specific helper a value of the other family. the
  // fingerprint answers both kinds instead: it collapses a runtime type to its identity, exactly as
  // a value fold would, and summarises a structural one member by member
  function branchResultsAgree(infos) {
    const keys = infos.map(info => annotationShapeKey(unwrapTypeAnnotation(info.annotation), info.scope, 0));
    return keys.every(key => key !== null && key === keys[0]);
  }

  // callable annotation shapes - a method / call signature or a function type
  const SIGNATURE_ANNOTATION_TYPES = new Set([
    'TSMethodSignature', 'TSFunctionType', 'TSCallSignatureDeclaration', 'FunctionTypeAnnotation',
  ]);

  // structural fingerprint of a type annotation, bounded in depth. a node that resolves to a
  // RUNTIME type collapses to that type's identity - dispatch only ever cares about the
  // constructor, so `string[]` and `number[]` share a fingerprint exactly as the value-typed
  // fold treats them as one `Array`. everything else is summarised structurally: member names
  // paired with their own fingerprints. null when the shape cannot be summarised (unsupported
  // node / depth exhausted), which makes the caller degrade rather than guess
  function annotationShapeKey(node, scope, depth) {
    if (!node || depth > 6) return null;
    // BEFORE the runtime resolve: every callable annotation resolves to the same `Function`, which
    // would make two signatures returning different families look identical. summarise it by what a
    // call through it yields instead
    if (SIGNATURE_ANNOTATION_TYPES.has(node.type)) {
      const returned = annotationShapeKey(unwrapTypeAnnotation(node.returnType ?? node.typeAnnotation), scope, depth + 1);
      return returned === null ? null : `()->${ returned }`;
    }
    const runtime = resolveTypeAnnotation(node, scope);
    if (runtime) return `@${ runtime.constructor ?? runtime.primitive ?? runtime.type }`;
    if (isTypeReferenceNode(node)) {
      return typeRefName(node) ?? null;
    }
    if (isObjectTypeLiteral(node)) {
      const members = node.members ?? node.properties;
      if (!Array.isArray(members)) return null;
      const parts = [];
      for (const member of members) {
        const name = member.key?.name ?? member.key?.value;
        if (name === undefined) return null;
        const inner = annotationShapeKey(unwrapTypeAnnotation(member.typeAnnotation), scope, depth + 1);
        if (inner === null) return null;
        parts.push(`${ name }:${ inner }`);
      }
      return `{${ parts.sort().join(',') }}`;
    }
    // an unsummarised node must NOT read as agreement - degrade instead of guessing
    return null;
  }

  function resolveMemberAnnotation(path, depth) {
    // the CANONICAL key resolver, not the raw node read: a computed key that names a static member
    // (`const k = 'a'; o[k]`) is the same access as `o['a']`, and reading the node alone dropped it
    // into the index-signature arm - the whole chain past that hop then lost its annotation
    const propName = resolveMemberPropertyName(path);
    const objInfo = findExpressionAnnotation(path.get('object'), depth + 1);
    if (!objInfo) return null;
    const unwrapped = unwrapTypeAnnotation(objInfo.annotation);
    if (!unwrapped) return null;
    const { node: aliased, subst } = followTypeAliasChain(unwrapped, objInfo.scope);
    const target = aliased ?? unwrapped;
    const keyKind = propName === null ? indexAccessKeyKind(path) : null;
    // the member being CALLED carries its call args for overload discrimination downstream
    const parentType = path.parentPath?.node?.type;
    const callPath = (parentType === 'CallExpression' || parentType === 'OptionalCallExpression')
      && path.parentPath.node.callee === path.node ? path.parentPath : null;
    // a numeric index into a POSITIONAL type is neither a named member nor an index signature, so
    // neither arm below can answer it: `getTypeMembers` on a tuple yields nothing to match by name,
    // and a tuple declares no index signature. the SIBLING lane already answers it - `findTypeMember`
    // routes a numeric key to `findTupleElement` - so without the same arm here the two member-lookup
    // lanes disagree, and which one runs depends on the shape of the FIRST hop: `o.inner[1]` resolved
    // (named hop enters the sibling lane) while `t[0][1]` and `t[0].v` died at the index hop, because
    // this lane returned no annotation for `t[0]` and the whole chain stopped there
    // the two INDEXABLE kinds are asked in the order the sibling lane asks them: a tuple answers
    // positionally, an array-shaped type answers with its element whatever the index. `arrayElementType`
    // is the right canon for the second and `extractElementAnnotation` is NOT - the latter answers
    // "element when ITERATED" and synthesizes `[K, V]` for a Map, whose `m[0]` is `undefined` at
    // runtime: narrowing that to a tuple would be a wrong family, not a coarse one
    const numericIndex = canonicalArrayIndex(propName);
    function lookup(typeNode) {
      if (numericIndex !== null) {
        const element = findTupleElement(typeNode, numericIndex, objInfo.scope) ?? arrayElementType(typeNode);
        if (element) return { annotation: applySubst(element, subst), scope: objInfo.scope, path: objInfo.path };
      }
      return propName === null
        ? resolveIndexSignatureValue(typeNode, objInfo.scope, subst, keyKind)
        : resolveMemberInTypeMembers({ typeNode, propName, scope: objInfo.scope, anchor: objInfo.path, subst, callPath });
    }
    if (isUnionType(target)) {
      // FOLD across the branches instead of taking the first that resolves: a value matching a
      // LATER branch would otherwise dispatch through the first branch's type-specific Maybe
      // and throw where the generic helper works. convergent branches keep the narrow (their
      // resolved types agree), divergent ones degrade to null - the same widen the sibling
      // member / index-signature unions perform
      const infos = [];
      for (const branch of target.types) {
        const peeled = applySubst(unwrapTypeAnnotation(branch), subst);
        if (isNullableOrNeverAnnotation(peeled)) continue;
        const result = lookup(peeled);
        // a branch whose member is missing / unresolvable leaves the union uncertain
        if (!result) return null;
        infos.push(result);
      }
      if (!infos.length) return null;
      if (infos.length > 1 && !branchResultsAgree(infos)) return null;
      return infos[0];
    }
    return lookup(target);
  }

  // member-by-name lookup against a single (non-union) type's structural members.
  // TSMethodSignature non-getter members yield the SIGNATURE itself - `obj.method` is a
  // function value; callers chain into `functionTypeReturnAnnotation` to peel the return.
  // Flow's `ObjectTypeProperty` stores the type in `m.value` (covers both property shape
  // AND method shape where value is a FunctionTypeAnnotation); fallback after the TS slots
  // NOTE this lookup hands back the member's RAW annotation and deliberately carries no optional
  // marker, unlike `findTypeMember`: every shape that reaches it puts the answer in RECEIVER
  // position, where the marker is ignored by design (a nullish receiver throws transformed or not).
  // measured, not assumed - the site IS reached with an optional member, and in each such shape the
  // fold that would read the marker either sits elsewhere or never routes here
  function resolveMemberInTypeMembers({ typeNode, propName, scope, anchor = null, subst, callPath = null }) {
    const members = typeNode ? getTypeMembers({ objectType: typeNode, scope }) : null;
    if (!members) return null;
    // an OVERLOADED method set (2+ same-named non-accessor signatures): the first arm's
    // return must not narrow a call TS routes to a later arm. with call args - arg-match
    // ONE; ambiguous / divergent / no call context - null (the caller's generic bail).
    // this annotation domain carries single nodes, so a set can't fold - it discriminates
    // or bails, mirroring the Type-domain canon fold
    const named = members.filter(m => keyMatchesName(m.key, propName, scope, m.computed)
      && m.kind !== 'get' && m.kind !== 'set' && m.type === 'TSMethodSignature');
    if (named.length >= 2) {
      const selected = callPath
        && discriminateOverloads(named, m => m.parameters ?? m.params,
          callArgumentPaths(callPath), resolveNodeType).selected;
      if (!selected) return null;
      return { annotation: applySubst(selected, subst), scope, path: anchor };
    }
    for (const m of members) {
      if (!keyMatchesName(m.key, propName, scope, m.computed)) continue;
      // honor accessor kind like findTypeMember (keep the shape handling in sync): a setter is write-only
      // - skip to a paired getter (any parser shape, not just TSMethodSignature); a GETTER yields its
      // RETURN type - babel carries it on the node, oxc/ESTree nests it on `value.returnType` (a class
      // getter as a `(TSAbstract)MethodDefinition` whose `.value` is a TSEmptyBodyFunctionExpression),
      // so the bare `?? m.value` read the FUNCTION and lost the chain past the getter; a plain method
      // signature yields the full signature (caller peels the return)
      if (m.kind === 'set') continue;
      let raw;
      if (m.kind === 'get') raw = m.typeAnnotation ?? m.returnType ?? m.value?.returnType;
      else if (m.type === 'TSMethodSignature') raw = m;
      else raw = m.typeAnnotation ?? m.returnType ?? m.value;
      if (!raw) continue;
      return { annotation: applySubst(raw, subst), scope, path: anchor };
    }
    return null;
  }

  // classify the dynamic key of a computed member access (`obj[k]`) as 'string' | 'number' |
  // 'symbol' so the matching index signature is selected; null when the key type is unresolvable
  function indexAccessKeyKind(memberPath) {
    const kind = resolveNodeType(memberPath.get('property'))?.type;
    return kind === 'string' || kind === 'number' || kind === 'symbol' ? kind : null;
  }

  // `obj[k]` where `obj: { [key: K]: V }` - resolve to V via TSIndexSignature member, selecting
  // the signature whose key type matches the access-key kind: a symbol key picks only a symbol
  // signature, a number key prefers number then string (numeric keys coerce to string), a string
  // key never picks number/symbol, and an UNRESOLVABLE one answers only when the type declares a
  // single signature - which one applies is then not a question; null on miss. mirrors the
  // static-key `pickIndexSignature` (type-members) for the kinds it knows - the dynamic path
  // bypassed it - but NOT for the unknown key, which is a different question: that mirror picks
  // per known kind, while an unknown key may be any kind at runtime
  // the applicable index-signature values as ONE annotation: a single signature answers as itself,
  // several fold through the standard union machinery downstream. synthesised rather than resolved
  // here because the caller's contract is an annotation node, not a Type
  function unionOfSignatures(sigs) {
    const present = [...new Set(sigs.filter(Boolean))].map(sig => unwrapTypeAnnotation(sig) ?? sig);
    return present.length ? unionAnnotationOf(present) : null;
  }

  function resolveIndexSignatureValue(typeNode, scope, subst, keyKind) {
    const members = typeNode ? getTypeMembers({ objectType: typeNode, scope }) : null;
    if (!members) return null;
    let numberSig = null;
    let stringSig = null;
    let symbolSig = null;
    for (const m of members) {
      if (m.type !== 'TSIndexSignature' || !m.typeAnnotation) continue;
      // peeled like the static-key mirror `pickIndexSignature`: oxc keeps `[k: (number)]`
      // as TSParenthesizedType where babel strips it - a raw read misfiled the signature
      // as string-keyed, over-resolving a string access to the number-sig value
      const sigKey = peelTSParenthesized(unwrapTypeAnnotation(m.parameters?.[0]?.typeAnnotation))?.type;
      if (sigKey === 'TSNumberKeyword') numberSig ??= m.typeAnnotation;
      else if (sigKey === 'TSSymbolKeyword') symbolSig ??= m.typeAnnotation;
      else stringSig ??= m.typeAnnotation;
    }
    let picked;
    switch (keyKind) {
      case 'symbol': picked = symbolSig; break;
      case 'number': picked = numberSig ?? stringSig; break;
      case 'string': picked = stringSig; break;
      // an unresolvable key may be ANY kind at runtime, so the value is the UNION of every
      // signature that could receive it - picking one narrows to a family the access may never
      // produce, and picking whichever was DECLARED FIRST made the answer depend on source order.
      // TS requires the numeric value to be assignable to the string one, so on conforming input
      // the union collapses back to the string signature and loses nothing; on input that does not
      // conform - which parses and reaches here regardless - it diverges and the fold degrades to
      // the generic dispatch instead of handing over a foreign family.
      // the union is only meaningful when SOME signature can receive an arbitrary key, and that is
      // the string one alone - TS converts a numeric key to a string, while a number-only or
      // symbol-only shape has no member for a plain string key at all. folding the survivors there
      // answered with a family the access may never produce, so it degrades instead
      default: picked = stringSig ? unionOfSignatures([stringSig, numberSig, symbolSig]) : null;
    }
    return picked ? { annotation: applySubst(picked, subst), scope } : null;
  }

  // a DESTRUCTURED name binds a MEMBER of the initializer, not the initializer itself. handing
  // back the init's own annotation makes `const { m } = i` read as `I`, and the call lane then
  // finds no return type on it - so a destructured method loses its return where the very same
  // method kept it when read as `i.m`. the Type lane already descends the key path; this is the
  // annotation lane's half of that walk, which is the half a call return is read from.
  // hands `info` back UNCHANGED where the member cannot be named at all - a rest slice, or an
  // overload set this lane has no call site to pick from; the caller then serves the generic
  function destructuredMemberAnnotation(info, bindingPath, name) {
    if (!info) return null;
    // a declarator carries the pattern on `id`; a destructured PARAMETER is the pattern itself
    const { node } = bindingPath;
    const pattern = node.type === 'VariableDeclarator' ? node.id : node;
    const keyPath = findPatternKeyPath(pattern, name, bindingPath.scope);
    if (!keyPath) return info;
    // a negative index is the array walker's REST sentinel: the binding is a SLICE of the source,
    // not a slot. a slice taken from position 0 IS the whole source, and every slice of a NON-
    // positional container (`string[]`) has the container's own type - both keep `info`. a
    // positional container (tuple, `Parameters<>`) sliced past 0 holds a different type at each
    // index, so handing the container back types the slice by the SOURCE's element 0 - a wrong
    // family, not merely a coarse one. `findTupleElement` is the positional test because it peels
    // wrappers and follows the alias chain, which a raw `tupleElements` read misses for `type T = [A, B]`
    const restAt = keyPath.findIndex(key => typeof key === 'number' && key < 0);
    if (restAt !== -1) {
      const sliceStart = -keyPath[restAt] - 1;
      if (!sliceStart) return info;
      const host = restAt ? annotationAtKeyPath(info.annotation, keyPath.slice(0, restAt), info.scope) : info.annotation;
      const unwrapped = host ? unwrapTypeAnnotation(host) : null;
      return unwrapped && findTupleElement(unwrapped, 0, info.scope) ? null : info;
    }
    const host = keyPath.length > 1
      ? annotationAtKeyPath(info.annotation, keyPath.slice(0, -1), info.scope) : info.annotation;
    if (!host) return null;
    // an OVERLOADED member cannot be answered here: this lane resolves the NAME, and the canon that
    // picks a head (`resolveMemberInTypeMembers`) needs the CALL to discriminate on. picking the
    // first head would be a guess, and in usage-pure a wrong head is a throw while an unresolved
    // name only degrades - hand the container back and let the generic dispatch serve it
    const leaf = keyPath.at(-1);
    const hostMembers = getTypeMembers({ objectType: unwrapTypeAnnotation(host), scope: info.scope }) ?? [];
    if (hostMembers.filter(m => m.type === 'TSMethodSignature'
      && keyMatchesName(m.key, leaf, info.scope, m.computed)).length >= 2) return info;
    const annotation = annotationAtKeyPath(host, [leaf], info.scope);
    return annotation ? { ...info, annotation } : null;
  }

  // an annotation always travels with the declaration it was WRITTEN at: `scope` is where its
  // names resolve, and the path is the lookup anchor for a container the parser opened no scope
  // for. one constructor for both fields - a site that set only `scope` left the anchor pointing
  // at the USE, which resolves a name against whatever namespace the use sits in
  function annotationAt(annotation, declPath) {
    return { annotation, scope: declPath.scope, path: declPath };
  }

  // find the raw type annotation of an expression (follows bindings and const chains).
  // memoized by path.node identity - `resolveFromMemberExpression` invokes this twice when
  // the resolved and original object paths differ, and recursive descents revisit common
  // ancestors; cache amortises the per-call O(chain-length) walk to a single pass per node
  let expressionAnnotationCache = new WeakMap();
  function findExpressionAnnotation(path, depth = 0) {
    if (depth > MAX_DEPTH) return null;
    if (!path?.node) return null;
    const cached = expressionAnnotationCache.get(path.node);
    // a stored result may itself be a budget artifact - a nested hop ran out and answered null -
    // so it only serves a call with no more budget left than the one that produced it. a shallower
    // reach has more to spend and recomputes. same rule the conditional-type memo carries
    if (cached !== undefined && depth >= cached.depth) return cached.result;
    const result = computeExpressionAnnotation(path, depth);
    expressionAnnotationCache.set(path.node, { result, depth });
    return result;
  }

  function resetExpressionAnnotationCache() {
    expressionAnnotationCache = new WeakMap();
  }

  function computeExpressionAnnotation(path, depth) {
    // path.node may be null on orphaned paths or stub slots - bail safely instead of
    // crashing on `.type` access. matches the defensive shape used elsewhere
    // ESTree preserves ParenthesizedExpression - unwrap
    if (path.node.type === 'ParenthesizedExpression') return findExpressionAnnotation(path.get('expression'), depth + 1);
    // ESTree wraps optional chains in ChainExpression (babel inlines); peel so the
    // inner MemberExpression hits its own branch below and resolves through the object
    if (path.node.type === 'ChainExpression') return findExpressionAnnotation(path.get('expression'), depth + 1);
    if (path.node.type === 'TSAsExpression' || path.node.type === 'TSSatisfiesExpression'
      || path.node.type === 'TSTypeAssertion' || path.node.type === 'TypeCastExpression') {
      return annotationAt(path.node.typeAnnotation, path);
    }
    if (path.node.type === 'TSNonNullExpression' || path.node.type === 'TSInstantiationExpression') {
      return findExpressionAnnotation(path.get('expression'), depth + 1);
    }
    if (t.isIdentifier(path.node)) {
      const binding = getScopeBinding(path.scope, path.node.name, path);
      if (!binding) return null;
      const annotation = findBindingAnnotation(binding.path);
      if (annotation) {
        // narrow declared union via the last straight-line assignment's literal-property
        // shape: TS treats `let f: Foo = init; f = { kind: 'b', ... }` as narrowing `f`
        // to FooB after the assignment. without this `f.data` after the assignment
        // resolves on the declared union and emits the generic polyfill
        const narrowed = narrowUnionByAssignmentLiteral(path, annotation, binding.path.scope);
        // the annotation of a destructured binding describes its CONTAINER (`function f({ m }: I)`),
        // so the same key-path descent the initializer lane needs applies here too
        return destructuredMemberAnnotation(annotationAt(narrowed ?? annotation, binding.path), binding.path, path.node.name);
      }
      if (!binding.constantViolations?.length && t.isVariableDeclarator(binding.path.node)) {
        const init = binding.path.get('init');
        if (init.node) {
          return destructuredMemberAnnotation(findExpressionAnnotation(init, depth + 1), binding.path, path.node.name);
        }
      }
    }
    // obj.prop / obj?.prop - resolve property type through the object's annotation chain,
    // carrying generic substitutions so `Wrapper<string>.inner.value()` resolves T -> string.
    // `resolveMemberAnnotation` self-guards on shape; null fall-through to the call branch below
    const memberResult = resolveMemberAnnotation(path, depth);
    if (memberResult) return memberResult;
    // direct `f()`: pull the callee's declared return type and substitute explicit call-site
    // type args (`makeBox<number>()`) so downstream member lookups see concrete types
    const callType = babelNodeType(path.node);
    // `new X()` walks the same callee annotation, but ONLY through a CONSTRUCT signature. a plain
    // function type's declared return is not the instance type - `new f()` discards a primitive
    // return and yields the fresh object - so a non-construct annotation must not answer here, and
    // the function-declaration lane below is skipped outright (a callee that resolves to a real
    // function or class is the type lane's business, under its own construct semantics).
    // without this entry the annotation simply stopped at the `new` hop, so a member read off an
    // inline object return (`new X().chars`) lost the annotation and the chain died there, while
    // the identical read behind a plain call annotation (`f().chars`) resolved
    const isConstruct = callType === 'NewExpression';
    function signatureReturn(annotation, scope) {
      if (!annotation) return null;
      // the construct GATE is all this adds: an alias is transparent to the signature it names
      // (`type Ctor = new () => T`), so the test applies to what the chain ends at, not to the
      // reference. the extraction itself is the canon's - it also shadows the signature's OWN type
      // params before applying the alias binding, which a re-derived `applySubst` would drop
      if (isConstruct) {
        const { node: aliased } = followTypeAliasChain(annotation, scope);
        if (!CONSTRUCT_SIGNATURE_TYPES.has((aliased ?? annotation)?.type)) return null;
      }
      return shadowedAliasReturnAnnotation(annotation, scope);
    }
    if (isConstruct || callType === 'CallExpression' || callType === 'OptionalCallExpression') {
      let fnPath = isConstruct ? null : resolveRuntimeExpression(path.get('callee'));
      // ambient `declare function f<T>(...): R` - babel doesn't bind the name, so
      // resolveRuntimeExpression returns the bare Identifier; the estree adapter binds it
      // and hands back ONE head of a possibly-overloaded ambient set. both shapes consult
      // the full by-name set - single-selecting a lone head bypasses arg-discrimination
      const ambientCalleeName = !fnPath ? null
        : t.isIdentifier(fnPath.node) && !isFunctionLike(fnPath.node) ? fnPath.node.name
        : isAmbientFunctionNode(fnPath.node) ? fnPath.node.id?.name : null;
      if (ambientCalleeName) {
        const ambients = findAmbientFunctionPaths(ambientCalleeName, fnPath.scope);
        // an OVERLOADED ambient set in this annotation domain (single nodes, no fold):
        // arg-match ONE overload or bail to generic - the first head's return narrowed a
        // call TS routes to a later overload (`pick(0).m` off a divergent pair)
        if (ambients.length >= 2) {
          const { selected } = discriminateOverloads(ambients, a => a.node.params,
            callArgumentPaths(path), resolveNodeType);
          if (!selected) return null;
          fnPath = selected;
        } else if (ambients.length === 1) {
          [fnPath] = ambients;
        }
      }
      if (fnPath && isFunctionLike(fnPath.node) && fnPath.node.returnType) {
        // explicit `<...>` args; argument inference fallback (`makeBox(arr)` lifts arr's
        // annotation onto T). without subst, generic return `{value: T}` leaks unsubstituted
        const subst = inferCallSiteSubst(fnPath.node, path, depth) ?? buildCallSiteSubst(fnPath.node, path.node, path.scope);
        const rawReturn = unwrapTypeAnnotation(fnPath.node.returnType);
        const annotation = subst ? applyAliasSubstDeep(rawReturn, subst) : rawReturn;
        return annotationAt(annotation, fnPath);
      }
      // typed method call `w.inner.value()`: only function-shaped annotations produce a
      // return type. non-function property annotations bail to keep downstream chains sound
      const callee = path.get('callee');
      if (callee.node.type === 'MemberExpression' || callee.node.type === 'OptionalMemberExpression') {
        const memberInfo = findExpressionAnnotation(callee, depth + 1);
        if (memberInfo) {
          const unwrappedMember = unwrapTypeAnnotation(memberInfo.annotation);
          const ret = signatureReturn(unwrappedMember, memberInfo.scope);
          if (ret) return { ...memberInfo, annotation: ret };
        }
      } else if (callee.node.type === 'Identifier') {
        // function-typed const callee: `declare const f: () => T; f().X` - extract returnType
        // from the binding's annotation. without this, `getObj()?.a.includes(...)` loses
        // receiver narrowing past the call hop because findExpressionAnnotation falls through
        const calleeInfo = findExpressionAnnotation(callee, depth + 1);
        const calleeAnnot = calleeInfo?.annotation && unwrapTypeAnnotation(calleeInfo.annotation);
        const ret = signatureReturn(calleeAnnot, calleeInfo?.scope ?? path.scope);
        if (ret) return { ...calleeInfo, annotation: ret };
      }
    }
    return null;
  }

  // call-site explicit type args (`makeBox<number>()`) -> {paramName -> argNode}
  // `scope` threads to buildSubstMap's capture-avoidance: an explicit instantiation arg that is a
  // bare reference colliding with a function type-param name (`fn<T, U>` called `<X, T>`) is resolved
  // to its declaration body so the transitive subst can't recapture it (`U -> T -> X`)
  function buildCallSiteSubst(fnNode, callNode, scope) {
    return buildSubstMap(fnNode.typeParameters?.params, getCallSiteTypeArgs(callNode)?.params, scope);
  }

  // inert unresolvable annotation node bound for a supplied-but-opaque type-param: it
  // substitutes into downstream slots as unknown (generic) and REPLACES the type-param
  // reference before the type-param-declaration default fallback can re-derive it
  const OPAQUE_TYPE_ARG = TS_UNKNOWN_TYPE;

  // synthetic keyword annotations for LITERAL args: this inference domain is annotation
  // nodes (`findExpressionAnnotation` reads declared types), so an un-annotated literal
  // arg looked opaque - it either fell to the declared default (a wrong-Maybe when the
  // literal's type differs) or degraded to generic. a literal's type is trivially known -
  // bridge it as an inert keyword node so the subst keeps the runtime ground truth. an
  // array literal maps to Array-of-unknown: container-level receiver precision, inert
  // element slot. objects / calls stay null (structural / unknowable here)
  const LITERAL_ARG_ANNOTATIONS = {
    StringLiteral: Object.freeze({ type: 'TSStringKeyword' }),
    TemplateLiteral: Object.freeze({ type: 'TSStringKeyword' }),
    NumericLiteral: TS_NUMBER_TYPE,
    BigIntLiteral: Object.freeze({ type: 'TSBigIntKeyword' }),
    BooleanLiteral: Object.freeze({ type: 'TSBooleanKeyword' }),
    ArrayExpression: Object.freeze({ type: 'TSArrayType', elementType: TS_UNKNOWN_TYPE }),
  };
  function literalArgAnnotation(node) {
    return node ? LITERAL_ARG_ANNOTATIONS[babelNodeType(node)] ?? null : null;
  }

  // infer T -> argAnnotation from runtime arg annotations when caller omits `<...>`
  // (`makeBox(arr)` with `function makeBox<T>(t: T)`). limited to direct `T` param shapes
  // (no container wrappers); SpreadElement bails whole inference since positional mapping breaks
  function inferCallSiteSubst(fnNode, callPath, depth) {
    if (getTypeArgs(callPath.node)?.params?.length) return null;
    const fnTypeParams = fnNode.typeParameters?.params;
    if (!fnTypeParams?.length) return null;
    const paramNames = new Set(fnTypeParams.map(typeParamName).filter(Boolean));
    const args = callArgumentPaths(callPath);
    // a spread breaks the positional arg->param mapping, so positional inference is
    // skipped - but the fill below must still run OPAQUE-guarded: TS infers the param
    // from the spread element, so bailing to the unguarded default fill (the caller's
    // `?? buildCallSiteSubst`) leaked a declared default (`<T = number[]>`) onto a
    // foreign runtime value. with a spread, ANY param position may be fed by it
    const hasSpread = args.some(a => a.node?.type === 'SpreadElement');
    // drop the leading `this` pseudo-param so param annotations align with the call args
    const params = dropLeadingThisParam(fnNode.params);
    const subst = new Map();
    const limit = hasSpread ? 0 : Math.min(params.length, args.length);
    for (let i = 0; i < limit; i++) {
      if (!params[i] || !args[i]) continue;
      const { param } = effectiveParam(params[i]);
      const paramAnnotation = unwrapTypeAnnotation(param?.typeAnnotation);
      const name = paramAnnotation && typeRefName(paramAnnotation);
      if (!name || !paramNames.has(name) || subst.has(name)) continue;
      const argInfo = findExpressionAnnotation(args[i], depth + 1);
      const argAnnot = (argInfo?.annotation && unwrapTypeAnnotation(argInfo.annotation))
        ?? literalArgAnnotation(args[i].node);
      if (argAnnot) subst.set(name, argAnnot);
    }
    // fill un-inferred params from their declared defaults so a partial inference doesn't
    // shadow `f<T, U = T[]>(t: T)` defaults at the call site. without this the `??` to
    // `buildCallSiteSubst` is skipped (subst is non-null) and U's default never propagates;
    // downstream typeparam-scope lookup recovers U as TSTypeReference but loses the inferred
    // T binding when walking through U's default (T's scope-lookup has no value).
    // a PRESENT-but-opaque arg must NOT fall to the default (the default would emit a
    // type-specific Maybe on a foreign runtime value): a type-param referenced ANYWHERE in
    // a param annotation whose call arg is present binds the inert unknown node instead
    for (const p of fnTypeParams) {
      const name = typeParamName(p);
      if (!name || subst.has(name)) continue;
      const singleName = new Set([name]);
      const argConstrained = !!hasParamTypeRef && params.some((prm, i) => (hasSpread || i < args.length)
        && hasParamTypeRef(effectiveParam(prm).param, singleName, 0));
      if (argConstrained) subst.set(name, OPAQUE_TYPE_ARG);
      else if (p.default) subst.set(name, p.default);
    }
    return subst.size ? subst : null;
  }

  // cluster-private: `resolveMemberAnnotation` / `resolveMemberInTypeMembers` /
  // `inferCallSiteSubst` (consumed only by `findExpressionAnnotation` / `resolveCallReturnType`
  // internally), and likewise `resolveCallReturnTypeFromAnnotation` / `staticPairFromDestructure`,
  // which the header used to advertise while no consumer outside this file called either
  return {
    resolveCallReturnType,
    violationToAssignment,
    functionTypeReturnAnnotation,
    shadowedAliasReturnAnnotation,
    findExpressionAnnotation,
    resolveIndexSignatureValue,
    indexAccessKeyKind,
    buildCallSiteSubst,
    resetExpressionAnnotationCache,
  };
}
