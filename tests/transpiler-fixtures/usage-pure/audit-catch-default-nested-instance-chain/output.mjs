import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// a catch-param destructure default with a nested instance-method chain (`[9].flat().at(0)`):
// relocating the default into the catch prelude must compose the inner `.flat` polyfill into the
// outer `.at` polyfill, not flat-splice the two overwrites into an overlap
try {} catch (_ref) {
  var _ref2, _ref3, _ref4;
  let it = (_ref2 = _getIteratorMethod(_ref)) === void 0 ? _atMaybeArray(_ref3 = _flatMaybeArray(_ref4 = [9]).call(_ref4)).call(_ref3, 0) : _ref2;
  it;
}