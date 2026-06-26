import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
var _ref, _ref2, _ref4, _ref5;
// A `.name` (MaybeFunction get) memoizes a proxy-global chain-root-call receiver as `_ref = (call, _Ctor)`.
// The call is harvested + re-emitted as a RAW source prefix, but its inner content must be resolved EXACTLY
// as the natural visitor would (the whole receiver collapse leaves the call's body visitor-rewritten and the
// transform-queue compose substitutes through it) - NOT a hand-rolled identifier-only re-emit. Two inner
// shapes a bare-identifier re-emit could not handle: a proxy-global MEMBER chain return (`globalThis.self`
// must collapse to the leaf `_self`, not a dead `_globalThis.self` hop) and a polyfillable member inside the
// call body (`[1].flat()` must polyfill). a SEQUENCE-wrapped receiver `(n, (call).self)` must peel to the
// chain-root call inside its tail (else its inner `globalThis` stranded raw). a bare control return anchors
// the common shape. distinct ctor per line.
let n = 0;
const memberChain = (_ref = ((() => {
  n += 1;
  return _self;
})(), _Map), _nameMaybeFunction(_ref));
const polyfillable = (_ref2 = ((() => {
  var _ref3;
  _flatMaybeArray(_ref3 = [1]).call(_ref3);
  return _globalThis;
})(), _Set), _nameMaybeFunction(_ref2));
const seqWrapped = (_ref4 = (n += 10, (() => {
  n += 100;
  return _globalThis;
})(), _Promise), _nameMaybeFunction(_ref4));
const control = (_ref5 = ((() => {
  n += 1000;
  return _globalThis;
})(), _WeakMap), _nameMaybeFunction(_ref5));
export { memberChain, polyfillable, seqWrapped, control, n };