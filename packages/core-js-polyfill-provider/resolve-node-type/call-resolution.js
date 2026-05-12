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
// the callee path. consolidating drops the thunks the factory previously needed between two
// separate clusters.
//
// Public surface:
//   resolveCallReturnType(callee)                     - main call-return entry
//   resolveCallReturnTypeFromAnnotation(callee)       - fallback for callees with no runtime
//                                                       resolution (cast / ambient / typeof)
//   functionTypeReturnAnnotation(node)                - cross-dialect return-slot extractor
//   staticPairFromDestructure(scope, name)            - destructure-alias static resolver
//   findExpressionAnnotation(path, depth?)            - { annotation, scope } | null
//   resolveMemberAnnotation(path, depth)              - obj.prop annotation resolution
//   resolveMemberInTypeMembers({ typeNode, propName, scope, subst }) - member-by-name lookup
//   resolveIndexSignatureValue(typeNode, scope, subst) - TSIndexSignature member resolution
//   buildCallSiteSubst(fnNode, callNode)              - explicit `<...>` args -> subst Map
//   inferCallSiteSubst(fnNode, callPath, depth)       - implicit T inference from arg annot
//
// `staticPairFromPolyfillEntry` stays in the factory because it's consumed by the
// binding-analysis cluster instantiated upstream (factory function declaration is hoisted;
// moving it here would force a cluster-instantiation-order rework)
import { walkStaticReceiverChain } from '../detect-usage/destructure.js';
import { MAX_DEPTH } from './base.js';
import { typeRefName } from './ast-shapes.js';
import { getTypeArgs } from '../helpers/ast-patterns.js';

const { hasOwn } = Object;

export function createCallResolution({
  t,
  babelNodeType,
  babelBindingAdapter,
  isMemberLike,
  isFunctionLike,
  isNullableOrNever,
  resolveNodeType,
  resolveRuntimeExpression,
  resolveReturnType,
  findAmbientFunctionPath,
  resolveFromMemberExpression,
  resolveKnownStaticReturnType,
  resolveKnownInstanceMember,
  KNOWN_INSTANCE_METHOD_RETURN_TYPES,
  staticPairFromPolyfillEntry,
  typeFromHint,
  lookupNested,
  KNOWN_STATIC_METHOD_RETURN_TYPES,
  findDestructuredKeyPath,
  swapAliasToTSTypeQueryWithSubst,
  resolveReturnTypeFromTypeQuery,
  resolveTypeAnnotation,
  unwrapTypeAnnotation,
  getMemberProperty,
  followTypeAliasChain,
  applySubst,
  applyAliasSubstDeep,
  isNullableOrNeverAnnotation,
  getTypeMembers,
  keyMatchesName,
  findBindingAnnotation,
  narrowUnionByAssignmentLiteral,
  buildSubstMap,
  typeParamName,
  effectiveParam,
}) {
  // --- Call-return dispatch ---

  function resolveMemberCallType(memberPath, callPath) {
    return resolveFromMemberExpression(memberPath, callPath)
      || resolveKnownStaticReturnType(memberPath, callPath)
      || resolveKnownInstanceMember(memberPath, KNOWN_INSTANCE_METHOD_RETURN_TYPES);
  }

  function resolveCallReturnType(callee) {
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
    if (isFunctionLike(resolved.node)) return resolveReturnType(resolved, callee.parentPath);
    // indirect call: const fn = obj.method; fn() - resolve through the stored member reference
    if (isMemberLike(resolved)) return resolveMemberCallType(resolved, callee.parentPath);
    // alias to a known static method through any shape:
    //   - direct: `const from = Array.from; from(x)` (babel mutates AST to
    //     `const from = _Array$from`, injector exposes entry='array/from' for `_Array$from`)
    //   - destructure: `const { from } = Array; from(x)` (unplugin keeps AST shape;
    //     `staticPairFromDestructure` walks pattern; babel post-rewrite alias map covers it)
    //   - default: `const { from = () => [] } = Array; from(x)` (babel post-rewrite emits
    //     `const from = _Array$from === void 0 ? () => [] : _Array$from;` - resolved
    //     node is ConditionalExpression, but the user-facing name `from` is registered
    //     in the body-extract alias map so polyfill-entry lookup succeeds)
    // probe via the callee's user-facing name first (matches ANY post-rewrite shape via
    // injector alias), then fall back to walked-resolved Identifier (covers cases where
    // alias map miss but resolved is itself a polyfill UID)
    if (t.isIdentifier(callee.node)) {
      const aliased = resolveAliasedStaticReturn(callee);
      if (aliased) return aliased;
    }
    if (resolved.node?.type === 'Identifier' && resolved.node !== callee.node) {
      const aliased = resolveAliasedStaticReturn(resolved);
      if (aliased) return aliased;
    }
    // identifier callees that didn't resolve to a function-like via the binding chain may still
    // be reachable through an ambient `declare function` not registered in scope.bindings,
    // or a binding whose annotation is a function-type (`declare const f: () => T`).
    // ambient lookup keyed by Identifier name; cast-on-callee shapes (`(fn as () => T)()`,
    // `(fn satisfies F)()`, `fn!()`) carry no Identifier here but still have an annotation
    // reachable via `findExpressionAnnotation` inside `resolveCallReturnTypeFromAnnotation`
    if (t.isIdentifier(callee.node)) {
      const ambient = findAmbientFunctionPath(callee.node.name, callee.scope);
      if (ambient) return resolveReturnType(ambient, callee.parentPath);
    }
    return resolveCallReturnTypeFromAnnotation(callee);
  }

  // resolve aliased static-method call return type. tries each alias shape's extractor
  // until one yields a (constructor, method) pair, then runs the shared registry lookup.
  // both extractors return null for non-matching shapes so the caller order doesn't
  // matter for correctness - polyfilled-entry first only because it's the cheaper probe
  function resolveAliasedStaticReturn(callee) {
    const pair = staticPairFromPolyfillEntry(callee.scope, callee.node.name)
      ?? staticPairFromDestructure(callee.scope, callee.node.name);
    if (!pair) return null;
    const retHint = lookupNested(KNOWN_STATIC_METHOD_RETURN_TYPES, pair.constructor, pair.method);
    return retHint ? typeFromHint(retHint) : null;
  }

  // unrewriten destructure alias resolution: walks the destructure pattern through nested
  // ObjectPatterns (`const { from } = Array`, `const { a: { from } } = wrapper`,
  // `const { ns: { from } } = { ns: Array }`) to a (constructor, method) pair. shorthand
  // (`{ from }`), renamed (`{ from: f }`), and AssignmentPattern wrappers (`{ from = ... }`)
  // are peeled inside `findDestructuredKeyPath`. delegates the init-walk to the shared
  // `walkStaticReceiverChain` (detect-usage/destructure.js) via a thin babel-binding
  // adapter; constructor registry gate stays here so the resolver still distinguishes
  // "any global Identifier at the leaf" from "known-static constructor with return type"
  function staticPairFromDestructure(scope, name) {
    const binding = scope?.getBinding(name);
    if (!binding?.path) return null;
    let declarator = binding.path;
    while (declarator && !t.isVariableDeclarator(declarator.node)) declarator = declarator.parentPath;
    if (!declarator) return null;
    const { id, init } = declarator.node;
    if (id?.type !== 'ObjectPattern' || !init) return null;
    const keyPath = findDestructuredKeyPath(id, name, declarator.scope);
    if (!keyPath?.length) return null;
    const constructor = walkStaticReceiverChain({
      receiverNode: init, walkPath: keyPath.slice(0, -1), scope: declarator.scope, adapter: babelBindingAdapter,
    });
    if (!constructor || !hasOwn(KNOWN_STATIC_METHOD_RETURN_TYPES, constructor)) return null;
    return { constructor, method: keyPath.at(-1) };
  }

  // Babel TSFunctionType: `typeAnnotation` (TSTypeAnnotation wrapper)
  // oxc TSFunctionType / Flow FunctionTypeAnnotation: `returnType` (raw type).
  // TSMethodSignature / TSDeclareMethod / ClassMethod / ClassPrivateMethod use the same
  // slot pair (babel `typeAnnotation`, oxc `returnType`) directly on the member node.
  // ESTree MethodDefinition wraps the function in `.value` so the return type lives one
  // level deeper. consumers (e.g. ReturnType<typeof X.method>) call into this when
  // `findTypeMember` returns the raw signature instead of a synthetic stub
  function functionTypeReturnAnnotation(node) {
    if (!node) return null;
    switch (node.type) {
      case 'TSFunctionType':
      case 'TSConstructorType':
      case 'TSMethodSignature':
      case 'TSDeclareMethod':
      case 'ClassMethod':
      case 'ClassPrivateMethod':
        return node.typeAnnotation ?? node.returnType;
      case 'MethodDefinition':
        return node.value?.returnType ?? node.value?.typeAnnotation;
      case 'FunctionTypeAnnotation':
        return node.returnType;
      default:
        return null;
    }
  }

  // extract return type from a binding's function-type annotation:
  //   `declare const f: () => T` / `const f: (x: X) => T = ...` / Flow `(x: X) => T` /
  //   `const f: typeof other` (follow TSTypeQuery to referenced function's return)
  function resolveCallReturnTypeFromAnnotation(callee) {
    const info = findExpressionAnnotation(callee);
    if (!info) return null;
    let annotation = unwrapTypeAnnotation(info.annotation);
    if (!annotation) return null;
    // follow alias chain to TSTypeQuery: `type Q<T> = typeof fn<T>` (TS 4.7+ instantiation
    // wrapped in generic alias). without the swap, downstream `functionTypeReturnAnnotation`
    // treats Q<...> as a TSTypeReference and returns null
    annotation = swapAliasToTSTypeQueryWithSubst(annotation, info.scope);
    if (annotation?.type === 'TSTypeQuery') return resolveReturnTypeFromTypeQuery(annotation, info.scope);
    const ret = functionTypeReturnAnnotation(annotation);
    return ret ? resolveTypeAnnotation(ret, info.scope) : null;
  }

  // --- Expression annotation walker ---

  // resolve obj.prop annotation by chaining through the object's type, applying generic subst.
  // unions like `Foo | null` peel null/undefined/never branches and resolve member in the
  // first remaining branch (mirrors the `member-resolve` cluster's union handling); without
  // this peel, deep optional chains `arr?.b.c.includes(1)` lose receiver type narrowing past
  // the second hop because `arr` annotation `{b:...}|null` makes `getTypeMembers` bail.
  // computed access without statically-known name (`obj[k]` where k isn't a literal) falls
  // back to TSIndexSignature lookup via `resolveIndexSignatureValue`
  function resolveMemberAnnotation(path, depth) {
    const propName = getMemberProperty(path.node);
    const objInfo = findExpressionAnnotation(path.get('object'), depth + 1);
    if (!objInfo) return null;
    const unwrapped = unwrapTypeAnnotation(objInfo.annotation);
    if (!unwrapped) return null;
    const { node: aliased, subst } = followTypeAliasChain(unwrapped, objInfo.scope);
    const target = aliased ?? unwrapped;
    const lookup = typeNode => propName === null
      ? resolveIndexSignatureValue(typeNode, objInfo.scope, subst)
      : resolveMemberInTypeMembers({ typeNode, propName, scope: objInfo.scope, subst });
    if (target.type === 'TSUnionType' || target.type === 'UnionTypeAnnotation') {
      for (const branch of target.types) {
        const peeled = applySubst(unwrapTypeAnnotation(branch), subst);
        if (isNullableOrNeverAnnotation(peeled)) continue;
        const result = lookup(peeled);
        if (result) return result;
      }
      return null;
    }
    return lookup(target);
  }

  // shared member-by-name lookup against a single (non-union) type's structural members.
  // returns annotation + scope on hit, null on miss (no members / no matching key)
  function resolveMemberInTypeMembers({ typeNode, propName, scope, subst }) {
    const members = typeNode ? getTypeMembers({ objectType: typeNode, scope }) : null;
    if (!members) return null;
    for (const m of members) {
      if (!keyMatchesName(m.key, propName)) continue;
      // getters are TSMethodSignature with kind:'get' but semantically read the return
      // type, not a function. regular methods fall through to the method-signature node
      // so downstream sees a function type for `const fn = obj.method`
      const isMethodProper = m.type === 'TSMethodSignature' && m.kind !== 'get';
      const raw = m.typeAnnotation ?? m.returnType ?? (isMethodProper ? m : null);
      if (!raw) continue;
      return { annotation: applySubst(raw, subst), scope };
    }
    return null;
  }

  // `obj[k]` where `obj: { [key: string]: V }` - resolve to V via TSIndexSignature member.
  // null on miss (no signature, or signature key type unsupported)
  function resolveIndexSignatureValue(typeNode, scope, subst) {
    const members = typeNode ? getTypeMembers({ objectType: typeNode, scope }) : null;
    if (!members) return null;
    for (const m of members) {
      if (m.type !== 'TSIndexSignature' || !m.typeAnnotation) continue;
      return { annotation: applySubst(m.typeAnnotation, subst), scope };
    }
    return null;
  }

  // find the raw type annotation of an expression (follows bindings and const chains)
  function findExpressionAnnotation(path, depth = 0) {
    if (depth > MAX_DEPTH) return null;
    // path.node may be null on orphaned paths or stub slots - bail safely instead of
    // crashing on `.type` access. matches the defensive shape used elsewhere
    if (!path?.node) return null;
    // ESTree preserves ParenthesizedExpression - unwrap
    if (path.node.type === 'ParenthesizedExpression') return findExpressionAnnotation(path.get('expression'), depth + 1);
    // ESTree wraps optional chains in ChainExpression (babel inlines); peel so the
    // inner MemberExpression hits its own branch below and resolves through the object
    if (path.node.type === 'ChainExpression') return findExpressionAnnotation(path.get('expression'), depth + 1);
    if (path.node.type === 'TSAsExpression' || path.node.type === 'TSSatisfiesExpression'
      || path.node.type === 'TSTypeAssertion' || path.node.type === 'TypeCastExpression') {
      return { annotation: path.node.typeAnnotation, scope: path.scope };
    }
    if (path.node.type === 'TSNonNullExpression' || path.node.type === 'TSInstantiationExpression') {
      return findExpressionAnnotation(path.get('expression'), depth + 1);
    }
    if (t.isIdentifier(path.node)) {
      const binding = path.scope?.getBinding(path.node.name);
      if (!binding) return null;
      const annotation = findBindingAnnotation(binding.path);
      if (annotation) {
        // narrow declared union via the last straight-line assignment's literal-property
        // shape: TS treats `let f: Foo = init; f = { kind: 'b', ... }` as narrowing `f`
        // to FooB after the assignment. without this `f.data` after the assignment
        // resolves on the declared union and emits the generic polyfill
        const narrowed = narrowUnionByAssignmentLiteral(path, annotation, binding.path.scope);
        return { annotation: narrowed ?? annotation, scope: binding.path.scope };
      }
      if (!binding.constantViolations?.length && t.isVariableDeclarator(binding.path.node)) {
        const init = binding.path.get('init');
        if (init.node) return findExpressionAnnotation(init, depth + 1);
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
    if (callType === 'CallExpression' || callType === 'OptionalCallExpression') {
      let fnPath = resolveRuntimeExpression(path.get('callee'));
      // ambient `declare function f<T>(...): R` - babel doesn't bind the name, so
      // resolveRuntimeExpression returns the bare Identifier. fall back to ambient lookup
      // (mirrors `resolveCallReturnType`'s ambient branch) so call-return annotations on
      // ambient generic fns get the same call-site subst as runtime fns
      if (t.isIdentifier(fnPath.node) && !isFunctionLike(fnPath.node)) {
        const ambient = findAmbientFunctionPath(fnPath.node.name, fnPath.scope);
        if (ambient) fnPath = ambient;
      }
      if (isFunctionLike(fnPath.node) && fnPath.node.returnType) {
        // explicit `<...>` args first; fall through to argument inference when caller
        // omitted them (`makeBox(arr)` -> infer T from arr's annotation), then declared
        // defaults via `buildCallSiteSubst`. inferred path bridges the gap babel itself
        // covers via TS's structural inference - without it, `function makeBox<T>(t: T): {value: T}`
        // returned `{value: T}` unsubstituted, dropping array narrowing on `b.value.at(0)`
        const subst = inferCallSiteSubst(fnPath.node, path, depth) ?? buildCallSiteSubst(fnPath.node, path.node);
        const annotation = subst
          ? applyAliasSubstDeep(unwrapTypeAnnotation(fnPath.node.returnType), subst)
          : fnPath.node.returnType;
        return { annotation, scope: fnPath.scope };
      }
      // typed method call: w.inner.value() - resolve callee's annotation, extract return type
      const callee = path.get('callee');
      if (callee.node.type === 'MemberExpression' || callee.node.type === 'OptionalMemberExpression') {
        const memberInfo = findExpressionAnnotation(callee, depth + 1);
        if (memberInfo) {
          const unwrappedMember = unwrapTypeAnnotation(memberInfo.annotation);
          // TSFunctionType -> extract return type; TSMethodSignature's typeAnnotation
          // is already the return type (not a function wrapper), use it directly
          const ret = functionTypeReturnAnnotation(unwrappedMember) ?? unwrappedMember;
          if (ret) return { annotation: ret, scope: memberInfo.scope };
        }
      }
      // function-typed const callee: `declare const f: () => T; f().X` - extract returnType
      // from the binding's annotation. without this, `getObj()?.a.includes(...)` loses
      // receiver narrowing past the call hop because findExpressionAnnotation falls through
      if (callee.node.type === 'Identifier') {
        const calleeInfo = findExpressionAnnotation(callee, depth + 1);
        const calleeAnnot = calleeInfo?.annotation && unwrapTypeAnnotation(calleeInfo.annotation);
        const ret = functionTypeReturnAnnotation(calleeAnnot);
        if (ret) return { annotation: ret, scope: calleeInfo.scope };
      }
    }
    return null;
  }

  // call-site explicit type args (`makeBox<number>()`) -> {paramName -> argNode}
  function buildCallSiteSubst(fnNode, callNode) {
    return buildSubstMap(fnNode.typeParameters?.params, getTypeArgs(callNode)?.params);
  }

  // infer {paramName -> argAnnotation} from runtime argument annotations when caller
  // omitted explicit `<...>` (`makeBox(arr)` with `function makeBox<T>(t: T)`: lift arr's
  // annotation onto T). limited to direct `T` param shapes (not container wrappers like
  // `T[]` / `Array<T>` / `Promise<T>`) so this stays cheap and doesn't rebuild
  // `buildTypeParamMap`'s full container-aware inference. depth threading prevents
  // recursion blowup when the arg's annotation lookup recurses through chained calls
  function inferCallSiteSubst(fnNode, callPath, depth) {
    if (getTypeArgs(callPath.node)?.params?.length) return null;
    const fnTypeParams = fnNode.typeParameters?.params;
    if (!fnTypeParams?.length) return null;
    const paramNames = new Set(fnTypeParams.map(typeParamName).filter(Boolean));
    const args = callPath.get('arguments');
    const { params } = fnNode;
    const subst = new Map();
    const limit = Math.min(params.length, args.length);
    for (let i = 0; i < limit; i++) {
      if (!params[i] || !args[i]) continue;
      const { param } = effectiveParam(params[i]);
      const paramAnnotation = unwrapTypeAnnotation(param?.typeAnnotation);
      const name = paramAnnotation && typeRefName(paramAnnotation);
      if (!name || !paramNames.has(name) || subst.has(name)) continue;
      const argInfo = findExpressionAnnotation(args[i], depth + 1);
      const argAnnot = argInfo?.annotation && unwrapTypeAnnotation(argInfo.annotation);
      if (argAnnot) subst.set(name, argAnnot);
    }
    return subst.size ? subst : null;
  }

  // cluster-private: `resolveMemberAnnotation` / `resolveMemberInTypeMembers` /
  // `inferCallSiteSubst` (consumed only by `findExpressionAnnotation` / `resolveCallReturnType`
  // internally)
  return {
    resolveCallReturnType,
    resolveCallReturnTypeFromAnnotation,
    functionTypeReturnAnnotation,
    staticPairFromDestructure,
    findExpressionAnnotation,
    resolveIndexSignatureValue,
    buildCallSiteSubst,
  };
}
