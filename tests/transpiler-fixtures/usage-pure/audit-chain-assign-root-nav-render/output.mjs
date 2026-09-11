import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
// a probe nav whose ROOT is a chain assignment. the hop `.self` is SUPPRESSED by the detector's
// marking - which exists so no emitter lands a rewrite inside the span that swallowed it -
// and with it went the meta that drives the kept-nav render, leaving
// a native `self` read. the marking stays; the hop is recorded as still-live instead, and only a
// meta whose own object is an ordinary name (a receiver PATH, not the chain's claim) records it
_globalThis.assignBox = {
  list: ['ab', 'cd'],
  n: 1
};
let heldClaim;
export const withClaim = null == (heldClaim = _globalThis).window ? void 0 : _Array$of(5);
let heldDispatch;
export const withDispatch = null == (_ref = null == (heldDispatch = _globalThis).window ? void 0 : _self.assignBox.list) ? void 0 : _at(_ref).call(_ref, 0);
let heldPlain;
export const withPlainTail = null == (heldPlain = _globalThis).window ? void 0 : _self.assignBox.n;
let heldNonOptional;
export const withNonOptionalRoot = null == (_ref2 = null == (heldNonOptional = _globalThis).window ? void 0 : _self.assignBox.list) ? void 0 : _at(_ref2).call(_ref2, 0);
export { heldClaim, heldDispatch, heldPlain, heldNonOptional };

// the same shapes over a tail name this file never writes: the detector knows nothing about it,
// which is exactly the case the suppressed hop used to swallow
let heldUnknown;
export const unknownTail = null == (_ref3 = null == (heldUnknown = _globalThis).window ? void 0 : _self.unknownBox.list) ? void 0 : _at(_ref3).call(_ref3, 0);
let heldUnknownDeep;
export const unknownDeepTail = null == (_ref4 = null == (heldUnknownDeep = _globalThis).window ? void 0 : _self.unknownBox.inner.list) ? void 0 : _at(_ref4).call(_ref4, 0);
export { heldUnknown, heldUnknownDeep };

// a claimless VALUE use over the same root: the hop collapse refuses a short-circuitable nav by
// canon, so both emitters fall through to the kept-nav render there - value positions
// need that fallback no less than receiver positions
let heldValue;
export const plainValueTail = null == (heldValue = _globalThis).window ? void 0 : _self.unknownBox.n;
let heldValueDeep;
export const plainValueDeepTail = null == (heldValueDeep = _globalThis).window ? void 0 : _self.unknownBox.inner.n;
export { heldValue, heldValueDeep };

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = null == (_ref5 = _atMaybeArray(_ref6 = ['ab', 'cd']).call(_ref6, (null == _globalThis.window ? void 0 : _self.assignBox.list) ? 0 : 1)) ? void 0 : _includesMaybeString(_ref5).call(_ref5, 'a');