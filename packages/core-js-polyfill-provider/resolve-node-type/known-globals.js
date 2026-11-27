// Known-builtin type lookup. resolves built-in static / instance / global hints from the
// shared `KNOWN_*` registries (`@core-js/compat/known-built-in-return-types` JSON) into
// `$Object` / `$Primitive` Type-object representations. shared by every site that needs to
// recognise `Math.max() -> number`, `arr.map() -> Array`, `globalThis.NaN -> number`, etc.
// without re-walking AST shape.
//
// Public surface:
//   typeFromHint(hint, objectType?, callPath?) - hint -> Type object (recursive for nested
//                                               element / resolved slots; objectType supplies
//                                               the 'inherit' inner, callPath the call-side
//                                               directives - omit it and they answer nothing)
//   resolveInnerType(type)                    - container element peel (string hint or
//                                               cached Type object slot)
//   unwrapPromise(type)                       - recursive Promise<Promise<...T>> -> T
//   promiseRefInner(node, scope)              - single-step Promise / PromiseLike /
//                                               Thenable type-ref -> first typeArg
//                                               annotation; null otherwise
//   isPromiseRefName(name)                    - name predicate for the synonym set
//   lookupNested(table, key1, key2)           - two-level registry table accessor
//   resolveGlobalMember(path)                 - MemberExpression -> { objectName, memberName }
//                                               when receiver is a known global
//   resolveKnownInstanceMember(path, table, callPath?)
//                                             - registry-keyed instance member resolver
//   resolveKnownStaticReturnType(callee, callPath)
//   resolveKnownPropertyReturnType(path)
//   resolveGlobalStaticReference(path)
//   resolveKnownGlobalReference(path)
import {
  PRIMITIVES,
  PRIMITIVE_WRAPPERS,
  PROMISE_SYNONYMS,
  RESOLUTION_DIRECTIVES,
  $Object,
  $Primitive,
  callArgumentPaths,
} from './base.js';
import { isTypeReferenceNode, typeRefName } from './ast-shapes.js';
import {
  callArgumentPathAt,
  effectiveArgsLength,
  FUNCTION_LIKE_NODE_TYPES,
  getTypeArgs,
  pathOfNode,
  peelTransparentWrapperPath,
  resolveCallArgument,
  resolveCallArgumentCoords,
  SKIPPABLE_WRAPPER_TYPES,
  unwrapRuntimeExpr,
  TRANSPARENT_EXPR_WRAPPER_TYPES,
} from '../helpers/ast-patterns.js';

const { hasOwn } = Object;

// invocation shapes whose value IS whatever the callee returns, so the return-shape rules below
// (`resolved` flattening, the `argument` directives) carry through them. `new` is excluded
// deliberately - it yields the constructed object no matter what the callee returns
const RETURNING_INVOCATION_TYPES = new Set([
  'CallExpression',
  'OptionalCallExpression',
  'TaggedTemplateExpression',
]);

const MAX_PEEL = 16;
const STRING_PROTOCOLS = {
  match: 'match', matchAll: 'matchAll', replace: 'replace', replaceAll: 'replace', search: 'search', split: 'split',
};

export function createKnownGlobals({
  babelNodeType,
  isMemberLike,
  isGlobalTypeName,
  settleValue,
  instanceSlotWritten,
  arrayElementsMayBeRetyped,
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
  // the vocabulary is the resolver's own, so it defaults to the declaration next door. it stays a
  // parameter only so a suite can hand in a doctored one: a directive the data ships with no
  // branch here is a mismatch nothing else can build
  KNOWN_RESOLUTION_DIRECTIVES = RESOLUTION_DIRECTIVES,
  commonType,
  elementContainerType,
  resolveSettledReturnType,
  resolveRuntimeExpression,
}) {
  // Registry membership needs no receiver type. Resolving an impossible property first
  // recursively re-resolves every prefix of a deep member chain, even for a plain proxy.
  const instancePropertyNames = new Set(Object.values(KNOWN_INSTANCE_PROPERTY_RETURN_TYPES).flatMap(Object.keys));

  // decode a return-type hint. object form: `type` is itself a string hint, optional
  // `element` / `resolved` inner hint, optional `nullable` - the spec return admits
  // undefined / null (`find` / `at` / `pop` / `exec` / ...), so the decoded type is
  // marked and the logical truthy-fold will not collapse on it
  // every directive, one reader. WHICH side a directive reads is data - the artifact ships it - so
  // both sides route off that field rather than one off data and the other off a literal name.
  // null means "this string is not a directive" for the name path below, and also "the directive
  // could not be read" - both leave the caller with no type, which is the same answer. a name the
  // data ships with no implementation is neither: it throws, because answering unknown would make
  // the narrow it was written for silently not happen
  function typeFromDirective(hint, objectType, callPath) {
    switch (KNOWN_RESOLUTION_DIRECTIVES[hint]) {
      case 'receiver': return resolveReceiverDirective(hint, objectType);
      case 'call': return resolveArgumentDirective(hint, callPath, objectType);
      default: return null;
    }
  }

  function resolveReceiverDirective(directive, objectType) {
    if (directive === 'inherit') return resolveInnerType(objectType);
    throw new Error(`no resolver for receiver directive '${ directive }'`);
  }

  function decodeTypeName(name) {
    if (isDirective(name)) return null;
    return PRIMITIVES.has(name) ? new $Primitive(name) : new $Object(name);
  }

  function typeFromHint(hint, objectType, callPath) {
    if (typeof hint === 'string') return typeFromDirective(hint, objectType, callPath) ?? decodeTypeName(hint);
    // A union has no single Type representation. The escape analysis can still read its members.
    // An instance method may likewise record effects without claiming a result type.
    if (Array.isArray(hint) || hint.type === undefined) return null;
    let base;
    // a directive as the hint's OWN type means the directive IS the answer, so an unreadable one
    // leaves nothing rather than falling back to a container the data never promised
    if (isDirective(hint.type)) {
      base = typeFromDirective(hint.type, objectType, callPath);
    } else if (PRIMITIVES.has(hint.type)) {
      base = new $Primitive(hint.type);
    } else {
      // A resolved slot unwraps promises. For an identity argument the value itself
      // can also have a then method, even when its nominal type is an ordinary object.
      const settles = hint.resolved !== undefined;
      const innerHint = hint.element ?? hint.resolved ?? null;
      let inner = innerHint ? typeFromHint(innerHint, objectType, callPath) : null;
      if (settles && inner) {
        inner = innerHint === 'argument' ? settleValue(directiveArgument(callPath), inner) : unwrapPromise(inner);
      }
      // an element the data never recorded, or an argument directive that could not be read, leaves
      // the container inner-less - the declared answer minus the precision, never a guess about what
      // the call was given. That absence is also the shape a BARE container has, which means
      // `Array<any>` and matches whatever it is weighed against, so it confesses instead: the table
      // says `Array` of nothing for `Object.entries` and `Map` of nothing for `Map.groupBy`, and two
      // of those compared EQUAL and answered TRUE where the two calls carry different elements. The
      // families with no element to record are reached as a CONSTRUCTOR box, which takes the mark
      // back off - a bare `Date` really does constrain nothing
      base = elementContainerType(new $Object(hint.type), null, inner);
    }
    return hint.nullable && base ? base.mark('mayBeNullish') : base;
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
  // return its first type argument unless a local binding shadows that name.
  function promiseRefInner(node, scope) {
    if (!isTypeReferenceNode(node)) return null;
    const name = typeRefName(node);
    if (!isPromiseRefName(name) || !isGlobalTypeName(name, scope)) return null;
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
      } else if (SKIPPABLE_WRAPPER_TYPES.has(type)) {
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
  // for methods, objectType is passed through to typeFromHint to resolve 'inherit'
  function resolveKnownInstanceMember(path, table, callPath,
    object = path.get('object'), name = resolveMemberPropertyName(path), pairing = null) {
    if (!name || !object) return null;
    const objectType = resolveNodeType(object);
    if (!objectType) return null;
    const key = objectType.primitive ? (PRIMITIVE_WRAPPERS[objectType.type] || null) : objectType.constructor;
    if (!key) return null;
    const hint = lookupNested(table, key, name);
    // An emitted dispatcher borrows its return type from the original method.
    // A stored array may have received different elements before that invocation.
    if (pairing && key === 'Array' && (hint === 'inherit' || hint?.type === 'inherit')
      && arrayElementsMayBeRetyped(object, callPath, { followed: pairing.thisArg })) return null;
    if (!hint || instanceSlotWritten?.(object, name) || isMutatedStatic(`${ key }.prototype`, name, { node: path.node, path })) return null;
    if (key === 'String' && hasOwn(STRING_PROTOCOLS, name)
      && (pairing ? pairing.argsUnknown || pairing.args.length : callPath?.node.arguments?.length)) {
      const argument = pairing ? !pairing.argsUnknown && pathOfNode(callPath, resolveCallArgument(pairing.args, 0))
        : directiveArgument(callPath);
      if (!argument) return null;
      const symbol = STRING_PROTOCOLS[name];
      const value = unwrapRuntimeExpr(argument.node);
      const regexp = value.type === 'RegExpLiteral' || !!value.regex;
      if (regexp ? isMutatedStatic('RegExp.prototype', `Symbol.${ symbol }`)
        : !resolveNodeType(argument)?.primitive) return null;
    }
    return typeFromHint(hint, objectType, pairing ? null : callPath);
  }

  // the ARGUMENT directives: what a call resolves to when the answer lives in the call itself
  // rather than in the method. they are the static-side twins of `inherit`, which names
  // the RECEIVER's inner, and the data spells them in the same slots - so a new method needs a row
  // there and nothing here.
  //   `argument`         - arg 0 itself; a resolved slot also assimilates thenables
  //   `argument-element` - settled elements of a literal input to a Promise combinator
  //   `argument-return`  - settled callback result, independently of data passed to Promise.try
  //   `mapped-element`, `then-return`, `reduce-accumulator` also account for argument 1
  // every one of them answers null on anything it cannot read - a literal-free iterable, a spread,
  // an unresolvable element - and the caller then serves the declared container bare
  // which side each directive reads is DATA, shipped beside the values it qualifies. restating the
  // list here would drift in the one direction nothing catches: a name this file has not heard of
  // is not an error, it decodes as an object type OF that name and the narrow silently stops
  function isDirective(name) {
    return hasOwn(KNOWN_RESOLUTION_DIRECTIVES, name);
  }

  // `new Promise.resolve(x)` constructs rather than returns the callee's value, so no directive
  // describes it. checked via node.type so the gate works for both babel paths (which expose
  // `.isCallExpression()`) and estree-toolkit paths (which do not)
  function directiveArgument(callPath, index = 0) {
    if (!RETURNING_INVOCATION_TYPES.has(callPath?.node?.type)) return null;
    const args = callArgumentPaths(callPath);
    // which raw slot holds the EFFECTIVE argument at `index` is the canon's question, and it answers
    // it better than a spread-anywhere bail did: `f(...[a, b])` still names its arguments, and only
    // a spread whose source is not a literal makes the position undecidable
    const coords = resolveCallArgumentCoords(args.map(a => a.node), index, isMutatedStatic);
    return coords ? callArgumentPathAt(args, coords) : null;
  }

  // the value a slot holds, as written. AWAITING is not this function's business: it belongs to the
  // `resolved` slot, which is what "settles to" means - `Promise.resolve(p)` unwraps p while
  // `Object.freeze(p)` hands the very same promise back, and both read argument 0 through here
  function typeOfArgument(path) {
    const type = path && resolveNodeType(path);
    return !type || isNullableOrNever(type) ? null : type;
  }

  // the function a callback slot NAMES: written inline, or referenced by a name the runtime-
  // expression canon resolves. null when the slot holds no function at all
  function callbackPathOf(path) {
    const type = path?.node && babelNodeType(path.node);
    if (!type) return null;
    if (FUNCTION_LIKE_NODE_TYPES.has(type)) return path;
    // only a REFERENCE has anything for the runtime canon to follow - a literal, an object or an
    // array denotes itself. this guard is not an optimisation detail: the walk runs on every later
    // argument of every directive call, and data arguments (`Promise.try(fn, 1, 2, 3)`) are the
    // common case. the wrapper set is the TRANSPARENT one, not the TS-only one: babel strips
    // `(mk)` at parse and oxc keeps a `ParenthesizedExpression`, so the narrower set answered
    // differently per parser on the same source
    if (type !== 'Identifier' && !TRANSPARENT_EXPR_WRAPPER_TYPES.has(type)) return null;
    const resolved = resolveRuntimeExpression(path);
    return resolved?.node && FUNCTION_LIKE_NODE_TYPES.has(babelNodeType(resolved.node)) ? resolved : null;
  }

  // the branches below ARE the list of call directives this file implements - a `default` that
  // throws is what keeps them honest against the shipped vocabulary, and it is reached even when
  // the argument is unreadable, so a name with no branch can never answer off the last one
  function resolveArgumentDirective(directive, callPath, objectType) {
    const first = directiveArgument(callPath);
    if (directive === 'argument') return first && typeOfArgument(first);
    if (directive === 'argument-element') return awaitedLiteralElement(first);
    if (directive !== 'argument-return' && directive !== 'mapped-element'
      && directive !== 'then-return' && directive !== 'reduce-accumulator') {
      throw new Error(`no resolver for call directive '${ directive }'`);
    }
    if (!first) return null;
    if (directive === 'argument-return') return callbackResult(first);
    const second = directiveArgument(callPath, 1);
    const length = second ? null : effectiveArgsLength(callArgumentPaths(callPath).map(arg => arg.node), isMutatedStatic);
    const absent = length !== null && length < 2;
    const secondType = second && resolveNodeType(second);
    if (directive === 'mapped-element') {
      if (!absent && secondType?.type !== 'undefined') return callbackResult(second);
      return isMutatedStatic('Array.prototype', 'Symbol.asyncIterator') ? null : awaitedLiteralElement(first);
    }
    if (directive === 'then-return') {
      // Unknown and spread rejection handlers can recover with a different family.
      const ctor = secondType?.constructor;
      const nonCallable = secondType?.primitive || ctor && ctor !== 'Function' && ctor !== 'Object';
      return absent || nonCallable ? callbackResult(first) : null;
    }
    // An empty iterator keeps its initial value. Without an initializer, a
    // singleton keeps its first element without invoking the reducer.
    const initial = absent ? resolveInnerType(objectType) : second && settleValue(second, secondType);
    const result = callbackResult(first);
    return initial && result ? commonType(initial, result) : null;
  }

  function callbackResult(path) {
    const fn = callbackPathOf(path);
    if (!fn) return null;
    const result = resolveSettledReturnType(fn);
    return result && !isNullableOrNever(result) ? result : null;
  }

  function awaitedLiteralElement(first) {
    if (!first || isMutatedStatic('Array.prototype', 'Symbol.iterator')) return null;
    const literal = peelTransparentWrapperPath(first);
    if (babelNodeType(literal.node) !== 'ArrayExpression') return null;
    let inner = null;
    for (const element of literal.get('elements')) {
      if (!element?.node || babelNodeType(element.node) === 'SpreadElement') return null;
      const awaited = settleValue(element, typeOfArgument(element));
      if (!awaited) return null;
      inner = inner ? commonType(inner, awaited) : awaited;
      if (!inner) return null;
    }
    return inner;
  }

  function resolveKnownStaticReturnType(callee, callPath) {
    if (!isMemberLike(callee)) return null;
    const info = resolveGlobalMember(callee);
    if (!info) return null;
    // a monkey-patched static returns whatever the patch returns - drop the known narrow to generic
    if (isMutatedStatic(info.objectName, info.memberName, { node: callee.node, path: callee })) return null;
    const hint = lookupNested(KNOWN_STATIC_METHOD_RETURN_TYPES, info.objectName, info.memberName);
    if (!hint) return null;
    return typeFromHint(hint, undefined, callPath);
  }

  function resolveKnownPropertyReturnType(path) {
    return instancePropertyNames.has(resolveMemberPropertyName(path))
      ? resolveKnownInstanceMember(path, KNOWN_INSTANCE_PROPERTY_RETURN_TYPES) : null;
  }

  // resolve type of a known global static member (e.g. Math.PI, Number.MAX_SAFE_INTEGER, Math.max)
  // static properties return their known type, static methods return Function
  function resolveGlobalStaticReference(path) {
    const info = resolveGlobalMember(path);
    if (!info) return null;
    const { objectName, memberName } = info;
    // a monkey-patched static holds whatever the patch assigned - drop the known narrow to generic,
    // mirroring resolveKnownStaticReturnType's gate
    if (isMutatedStatic(objectName, memberName, { node: path.node, path })) return null;
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

  // `resolveArgumentDirective` stays cluster-private (used only inside `typeFromDirective`);
  // `resolveGlobalMember` also names the static a callee calls (`resolveStaticCalleePair`)
  return {
    resolveGlobalMember,
    typeFromHint,
    resolveInnerType,
    unwrapPromise,
    promiseRefInner,
    isPromiseRefName,
    lookupNested,
    resolveKnownInstanceMember,
    resolveKnownStaticReturnType,
    resolveKnownPropertyReturnType,
    resolveGlobalStaticReference,
    resolveKnownGlobalReference,
  };
}
