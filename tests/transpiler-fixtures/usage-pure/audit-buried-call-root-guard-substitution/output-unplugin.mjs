import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$values from "@core-js/pure/actual/object/values";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
import _String$fromCodePoint from "@core-js/pure/actual/string/from-code-point";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16;
// an inline-call chain root BURIES the proxy-global (an IIFE body, an identity argument), and the
// only hop is one core-js does not ponyfill, so nothing collapses and the guard test keeps the root
// text. the buried global carries no rewrite of its own there - the claim replaces the span it sits
// in - so the guard RENDER has to substitute it, else the memo freezes a bare `globalThis` (ie:11
// ReferenceError) with no import at all. a callee declared ABOVE the chain is the boundary: its
// global lies outside the rendered span and polyfills through its own declaration. one static and
// one instance method per line, so a row that stops resolving is visible in the import set too.
export const iifeRoot = null == (_ref = (() => _globalThis)()?.window) ? void 0 : _atMaybeArray(_ref2 = _Array$of(5)).call(_ref2, 0);
export const identityArgRoot = null == (_ref3 = (x => x)(_globalThis)?.window) ? void 0 : _flatMaybeArray(_ref4 = _Array$from([1, 2])).call(_ref4);
export const functionExprRoot = null == (_ref5 = (function () { return _globalThis; })()?.window) ? void 0 : _toFixedMaybeNumber(_ref6 = _Number$MAX_SAFE_INTEGER).call(_ref6, 2);
export const selfRoot = null == (_ref7 = (() => _self)()?.window) ? void 0 : _padStartMaybeString(_ref8 = _String$fromCodePoint(97, 98)).call(_ref8, 4, '-');

// the root stays buried under an effect-bearing body and under a computed key carrying its own
// effect - both keep it inside the kept test, so the substitution has to reach it there too
let bodyCount = 0;
export const effectfulBodyRoot = null == (_ref9 = (() => {
  bodyCount++;
  return _globalThis;
})()?.window) ? void 0 : _findLastIndexMaybeArray(_ref10 = _Object$entries({ a: 1 })).call(_ref10, pair => pair[0] === 'a');
let keyCount = 0;
export const computedKeyRoot = null == (_ref11 = (() => _globalThis)()?.window) ? void 0 : _includesMaybeArray(_ref12 = (keyCount++, _Object$values)({ b: 2 })).call(_ref12, 2);

// BOUNDARY: the callee is declared above the chain, so its global sits outside the guard's span
const above = () => _globalThis;
export const declaredCallee = null == (_ref13 = above()?.window) ? void 0 : _flatMapMaybeArray(_ref14 = _Reflect$ownKeys({ c: 3 })).call(_ref14, key => [key]);

// NEGATIVE: a parameter shadows the name - neither the inline proof nor the substitution fires
export const shadowedRoot = (globalThis => globalThis)(null)?.window?.Promise.resolve(4).finally(() => {});

// a callee that IGNORES its parameter yields the same value for every argument, so the root proves
// like the no-param spelling; a callee that READS its parameter proves only what the ARGUMENT is
const ignores = x => _globalThis;
export const paramIgnoringRoot = null == ignores(1).window ? void 0 : _Set.prototype.has.call(new _Set([1]), 1);
const reads = x => x;
export const paramReadingRoot = reads({ window: { Set: { prototype: null } } })?.window?.Set.prototype;

// NEGATIVE: a call root yielding an object of the user's own keeps the chain off the memo - the key
// spelled here is theirs, not the global's, and swapping it in would change which function runs
const plain = () => ({ window: { Math: { trunc: x => [x, 'custom'] } } });
export const nonProxyRoot = null == (_ref15 = plain()?.window) ? void 0 : _at(_ref16 = _ref15.Math.trunc(6.7)).call(_ref16, 0);

// NEGATIVE: no live optional over the hop - the emit SWALLOWS the receiver instead of keeping it
// in a test, and the buried global goes with it
export const swallowedReceiver = _Map$groupBy([1], x => x);

// a call root FORWARDING the real global through an object literal: the shorthand binding IS
// the global constructor (the container walk descends the returned literal like a const-bound
// one), so the claim resolves and the polyfill lands; the user-object negative above stays raw,
// and a CONDITIONALLY-assigned forwarder proves no value
const forwards = () => ({ window: { Array } });
export const literalForwardedRoot = null == forwards()?.window ? void 0 : _Array$of(13);
const forwardsExplicit = () => ({ window: { Array: Array } });
export const literalForwardedExplicit = null == forwardsExplicit()?.window ? void 0 : _Array$of(14);
let maybeForwards;
if (_globalThis.setTimeout) maybeForwards = () => ({ window: { Array } });
export const conditionalForwarder = maybeForwards?.()?.window?.Array.of(15);