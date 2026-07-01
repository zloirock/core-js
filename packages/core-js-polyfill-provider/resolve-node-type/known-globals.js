// Known-builtin type lookup. resolves built-in static / instance / global hints from the
// shared `KNOWN_*` registries (`@core-js/compat/known-built-in-return-types` JSON) into
// `$Object` / `$Primitive` Type-object representations. shared by every site that needs to
// recognise `Math.max() -> number`, `arr.map() -> Array`, `globalThis.NaN -> number`, etc.
// without re-walking AST shape.
//
// Public surface:
//   typeFromHint(hint, objectType?)           - hint -> Type object (recursive for nested
//                                               element / resolved slots; objectType
//                                               supplies 'element' / 'inherit' inner)
//   resolveInnerType(type)                    - container element peel (string hint or
//                                               cached Type object slot)
//   unwrapPromise(type)                       - recursive Promise<Promise<...T>> -> T
//   promiseRefInner(node)                     - single-step Promise / PromiseLike /
//                                               Thenable type-ref -> first typeArg
//                                               annotation; null otherwise
//   isPromiseRefName(name)                    - name predicate for the synonym set
//   lookupNested(table, key1, key2)           - two-level registry table accessor
//   resolveGlobalMember(path)                 - MemberExpression -> { objectName, memberName }
//                                               when receiver is a known global
//   resolveKnownInstanceMember(path, table)   - registry-keyed instance member resolver
//   resolveKnownStaticReturnType(callee, callPath)
//   resolveKnownPropertyReturnType(path)
//   resolveGlobalStaticReference(path)
//   resolveKnownGlobalReference(path)
//   inferPromiseResolveReturnType(callPath)   - `Promise.resolve(x)` arg-based inner peel
import { PRIMITIVES, PRIMITIVE_WRAPPERS, PROMISE_SYNONYMS, $Object, $Primitive } from './base.js';
import { typeRefName } from './ast-shapes.js';
import { getTypeArgs, TS_EXPR_WRAPPERS } from '../helpers/ast-patterns.js';

const { hasOwn } = Object;

const MAX_PEEL = 16;

export function createKnownGlobals({
  babelNodeType,
  isMemberLike,
  isMutatedStatic = () => false,
  isNullableOrNever,
  resolveMemberPropertyName,
  resolveGlobalName,
  resolveNodeType,
  KNOWN_STATIC_METHOD_RETURN_TYPES,
  KNOWN_STATIC_PROPERTY_RETURN_TYPES,
  KNOWN_INSTANCE_PROPERTY_RETURN_TYPES,
  KNOWN_GLOBAL_PROPERTY_RETURN_TYPES,
  KNOWN_GLOBAL_METHOD_RETURN_TYPES,
}) {
  function typeFromHint(hint, objectType) {
    if (typeof hint === 'string') {
      if (hint === 'element' || hint === 'inherit') return resolveInnerType(objectType);
      if (PRIMITIVES.has(hint)) return new $Primitive(hint);
      return new $Object(hint);
    }
    if (PRIMITIVES.has(hint.type)) return new $Primitive(hint.type);
    const innerHint = hint.element ?? hint.resolved ?? null;
    const inner = innerHint ? typeFromHint(innerHint, objectType) : null;
    return new $Object(hint.type, inner);
  }

  // resolve the inner (element/resolved) type of a container
  // $Primitive stores inner as a hint string (lazy), $Object stores it as a type object (eager)
  function resolveInnerType(type) {
    if (!type?.inner) return null;
    const { inner } = type;
    return typeof inner === 'string' ? new $Primitive(inner) : inner;
  }

  // recursively unwrap Promise layers: Promise<Promise<T>> -> T
  // Promise without inner (Promise<any>) unwraps to null (unknown) since await resolves to any
  function unwrapPromise(type) {
    let result = type;
    while (result?.type === 'object' && result.constructor === 'Promise') {
      const inner = resolveInnerType(result);
      if (!inner) return null;
      result = inner;
    }
    return result;
  }

  // single-source predicate for "type-ref name unwraps as a Promise per Awaited<> semantics".
  // shared between every site that needs to recognise Promise / PromiseLike / Thenable -
  // extending the synonym set propagates through one place
  function isPromiseRefName(name) {
    return name === 'Promise' || PROMISE_SYNONYMS.has(name);
  }

  // single-step probe: if `node` is a Promise / PromiseLike / Thenable type-reference,
  // return its first type-argument annotation; null otherwise. shape-only, no recursion.
  // shared between `getPromiseInnerAnnotation` (callers want one layer for distribute)
  // and `unwrapPromiseAnnotation` (callers loop for full unwrap)
  function promiseRefInner(node) {
    if (node?.type !== 'TSTypeReference' && node?.type !== 'GenericTypeAnnotation') return null;
    if (!isPromiseRefName(typeRefName(node))) return null;
    return getTypeArgs(node)?.params?.[0] ?? null;
  }

  // two-level table lookup: table[key1][key2]
  function lookupNested(table, key1, key2) {
    const group = hasOwn(table, key1) ? table[key1] : null;
    return group && hasOwn(group, key2) ? group[key2] : null;
  }

  // the receiver may sit behind transparent wrappers or a sequence tail
  // (`(eff(), Array).from(x)`): peel those structural forms before the global lookup. this is a
  // bounded (MAX_PEEL) structural peel - transparent wrappers / sequence-tail / simple `=`
  // assignment only; it does NOT follow identifier bindings the way `resolveRuntimeExpression` does
  function peelToRuntimeObject(objectPath) {
    let cur = objectPath;
    for (let i = 0; i < MAX_PEEL && cur?.node; i++) {
      const { type } = cur.node;
      if (type === 'SequenceExpression' && cur.node.expressions.length) {
        cur = cur.get('expressions')[cur.node.expressions.length - 1];
      } else if (type === 'AssignmentExpression' && cur.node.operator === '=') {
        // `(a = Array).from()` evaluates to the assigned value (rightmost operand) at runtime -
        // peel to the right operand so the return type narrows off the real constructor
        cur = cur.get('right');
      } else if (type === 'ParenthesizedExpression' || type === 'ChainExpression'
        || TS_EXPR_WRAPPERS.has(type)) {
        cur = cur.get('expression');
      } else break;
    }
    return cur;
  }

  // resolve the global object name and property name from a MemberExpression
  function resolveGlobalMember(path) {
    const memberName = resolveMemberPropertyName(path);
    if (!memberName) return null;
    const objectName = resolveGlobalName(peelToRuntimeObject(path.get('object')));
    return objectName ? { objectName, memberName } : null;
  }

  // resolve return type of a known instance member (method or property) from a lookup table
  // for methods, objectType is passed through to typeFromHint to resolve 'element'/'inherit'
  function resolveKnownInstanceMember(path, table) {
    const name = resolveMemberPropertyName(path);
    if (!name) return null;
    const objectType = resolveNodeType(path.get('object'));
    if (!objectType) return null;
    const key = objectType.primitive ? (PRIMITIVE_WRAPPERS[objectType.type] || null) : objectType.constructor;
    if (!key) return null;
    const hint = lookupNested(table, key, name);
    if (!hint) return null;
    return typeFromHint(hint, objectType);
  }

  // `Promise.resolve(x)` -> `Promise<typeof x>`: arg-based inner inference. the static
  // hint table can't carry "infer inner from argN" cleanly (it'd require typeFromHint to
  // accept callPath everywhere), so handle this widely-used resolver-style static specially.
  // without this, `await Promise.resolve([1,2,3])` resolves to $Promise<null>, unwrapPromise
  // returns null, await gives unknown, downstream member dispatch goes generic.
  // `Promise.resolve(thenable)` flattens at runtime; treat outer Promise<Promise<X>> as
  // Promise<X> so unwrapPromise lands on a precise inner without two-layer peel.
  //
  // EXTENSION POINT: future "arg-based static inference" needs (e.g. `Array.of(...args)` ->
  // Array<commonType>, `Map.groupBy(arr, fn)` -> Map<ReturnType<fn>, arr-inner>) currently
  // require new special-case helpers. when adding a third resolver-style static, consider
  // promoting to a registry pattern (`{ 'Promise.resolve': inferFn, 'Array.of': ..., ... }`)
  // keyed in `resolveKnownStaticReturnType` rather than open-coding each one
  function inferPromiseResolveReturnType(callPath) {
    // defensive: callPath may be TaggedTemplateExpression when invoked via tag-recursion
    // (`String.raw\`...\``) - TT has no `arguments` slot. check via node.type so the guard
    // works for both babel paths (which expose `.isCallExpression()`) and estree-toolkit
    // paths (which do not)
    const callType = callPath?.node?.type;
    if (callType !== 'CallExpression' && callType !== 'OptionalCallExpression') return null;
    const [argPath] = callPath.get('arguments');
    if (!argPath || babelNodeType(argPath.node) === 'SpreadElement') return null;
    const argType = resolveNodeType(argPath);
    if (!argType || isNullableOrNever(argType)) return null;
    return new $Object('Promise', argType.constructor === 'Promise' ? resolveInnerType(argType) : argType);
  }

  // a static flagged `returnsArgument: N` returns that argument unchanged (ECMAScript identity,
  // e.g. Object.freeze -> 0), so the result keeps the argument's concrete container type:
  // `Object.freeze([...]).includes()` must narrow to the array, not the registry's generic 'Object'
  // (which drops the polyfill on ie:11). null when the slot is absent / preceded-or-filled by a
  // spread / unknown, so the caller falls back to the declared hint. mirrors `inferPromiseResolveReturnType`
  function inferReturnedArgType(callPath, index) {
    const callType = callPath?.node?.type;
    if (callType !== 'CallExpression' && callType !== 'OptionalCallExpression') return null;
    const args = callPath.get('arguments');
    const argPath = args[index];
    // a spread at or before the target index makes positional matching undecidable
    if (!argPath || args.slice(0, index + 1).some(a => babelNodeType(a.node) === 'SpreadElement')) return null;
    const argType = resolveNodeType(argPath);
    return argType && !isNullableOrNever(argType) ? argType : null;
  }

  // resolve a known static method's return type from its registry hint + call path. the arg-inference
  // specials run BEFORE the declared hint: `Promise.resolve(x)` peels the arg's inner type, and a
  // `returnsArgument: N` static (Object.freeze / seal / defineProperty ...) returns that argument's
  // concrete type. shared by the direct (`Object.freeze(a)`) and aliased (`const { freeze } = Object;
  // freeze(a)`) paths so both narrow identically instead of the aliased one dropping to generic 'Object'
  function resolveStaticReturnFromHint({ objectName, memberName, hint, callPath }) {
    if (callPath && objectName === 'Promise' && memberName === 'resolve') {
      const inferred = inferPromiseResolveReturnType(callPath);
      if (inferred) return inferred;
    }
    if (callPath && typeof hint.returnsArgument === 'number') {
      const inferred = inferReturnedArgType(callPath, hint.returnsArgument);
      if (inferred) return inferred;
    }
    return typeFromHint(hint);
  }

  function resolveKnownStaticReturnType(callee, callPath) {
    if (!isMemberLike(callee)) return null;
    const info = resolveGlobalMember(callee);
    if (!info) return null;
    // a monkey-patched static returns whatever the patch returns - drop the known narrow to generic
    if (isMutatedStatic(info.objectName, info.memberName)) return null;
    const hint = lookupNested(KNOWN_STATIC_METHOD_RETURN_TYPES, info.objectName, info.memberName);
    if (!hint) return null;
    return resolveStaticReturnFromHint({ objectName: info.objectName, memberName: info.memberName, hint, callPath });
  }

  function resolveKnownPropertyReturnType(path) {
    return resolveKnownInstanceMember(path, KNOWN_INSTANCE_PROPERTY_RETURN_TYPES);
  }

  // resolve type of a known global static member (e.g. Math.PI, Number.MAX_SAFE_INTEGER, Math.max)
  // static properties return their known type, static methods return Function
  function resolveGlobalStaticReference(path) {
    const info = resolveGlobalMember(path);
    if (!info) return null;
    const { objectName, memberName } = info;
    const propHint = lookupNested(KNOWN_STATIC_PROPERTY_RETURN_TYPES, objectName, memberName);
    if (propHint) return typeFromHint(propHint);
    return lookupNested(KNOWN_STATIC_METHOD_RETURN_TYPES, objectName, memberName) ? new $Object('Function') : null;
  }

  // resolve type of a global property or method accessed through a global proxy
  // e.g. globalThis.NaN -> number, window.parseInt -> Function
  function resolveKnownGlobalReference(path) {
    const name = resolveGlobalName(path);
    if (!name) return null;
    if (hasOwn(KNOWN_GLOBAL_PROPERTY_RETURN_TYPES, name)) return typeFromHint(KNOWN_GLOBAL_PROPERTY_RETURN_TYPES[name]);
    if (hasOwn(KNOWN_GLOBAL_METHOD_RETURN_TYPES, name)) return new $Object('Function');
    return null;
  }

  // `resolveGlobalMember` / `inferPromiseResolveReturnType` stay cluster-private (used
  // only inside `resolveKnownStaticReturnType` / `resolveGlobalStaticReference`)
  return {
    typeFromHint,
    resolveInnerType,
    unwrapPromise,
    promiseRefInner,
    isPromiseRefName,
    lookupNested,
    resolveKnownInstanceMember,
    resolveStaticReturnFromHint,
    resolveKnownStaticReturnType,
    resolveKnownPropertyReturnType,
    resolveGlobalStaticReference,
    resolveKnownGlobalReference,
  };
}
