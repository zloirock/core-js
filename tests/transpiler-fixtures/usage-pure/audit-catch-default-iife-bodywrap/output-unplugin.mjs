import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// a catch-param destructure default with an IIFE whose arrow body hosts an instance-method
// polyfill (`[1].at(0)`): the arrow body-wrap and the `.at` overwrite cover the same range and
// must compose, not collide, when the default is relocated into the catch prelude
try {} catch (_ref) {
let _ref3, it = (_ref3 = _getIteratorMethod(_ref)) === void 0 ? (() => { var _ref2; return _atMaybeArray(_ref2 = [1]).call(_ref2, 0); })() : _ref3; it; }