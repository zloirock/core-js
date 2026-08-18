import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a guard render rewrites the proxy globals inside its own span, so it OWNS them: leaving them
// visible queues a second transform over the same range, and the composition then has to guess
// which occurrence is whose. it guesses by ordinal and lands on whatever spells the same name
// first - a property key, or the inside of a string literal. a shorthand property is the third
// spelling of the collision: its key and value are two nodes over ONE range.
function opaque(o) {
  return _globalThis;
}
export const stringKey = null == opaque({
  "self": _self
}).window ? void 0 : _Array$of;
export const identKey = null == opaque({
  self: _self
}).window ? void 0 : _Array$of;
export const shorthandKey = null == opaque({
  self: _self
}).window ? void 0 : _Array$of;
// NEGATIVE: a key that spells something else was never at risk
export const otherKey = null == opaque({
  k: _self
}).window ? void 0 : _Array$of;
// NEGATIVE: two values, no key collision - both substitute
export const twoValues = null == opaque({
  a: _self,
  b: _self
}).window ? void 0 : _Array$of;