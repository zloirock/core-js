import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// A function-name read consumes its effectful constructor receiver once, preserving the call
// prefix and all inner polyfills. Returned proxy navigation follows its normal collapse rule,
// and sequence-wrapped receivers retain their preceding effects. Each constructor has its
// own source shape so one rewritten call cannot hide another.
let n = 0;
const memberChain = _nameMaybeFunction(((() => {
  n += 1;
  return _self;
})(), _Map));
const polyfillable = _nameMaybeFunction(((() => {
  var _ref;
  _flatMaybeArray(_ref = [1]).call(_ref);
  return _globalThis;
})(), _Set));
const seqWrapped = _nameMaybeFunction((n += 10, (() => {
  n += 100;
  return _globalThis;
})(), _Promise));
const control = _nameMaybeFunction(((() => {
  n += 1000;
  return _globalThis;
})(), _WeakMap));
export { memberChain, polyfillable, seqWrapped, control, n };