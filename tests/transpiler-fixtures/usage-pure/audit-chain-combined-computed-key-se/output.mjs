import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
var _ref, _ref2;
// A computed-key sequence on an optional inner call evaluates the receiver before the key effect.
// The key effect runs once, and the method lookup and call use that same receiver.
// The trailing map consumes the inner call result only when the optional call continues.
declare const arr: {
  flat?: () => number[];
};
declare const eff: () => 'flat';
null == (_ref = (arr, eff(), _flatMaybeArray(arr))) ? void 0 : _mapMaybeArray(_ref2 = _ref.call(arr)).call(_ref2, (x: number) => x);