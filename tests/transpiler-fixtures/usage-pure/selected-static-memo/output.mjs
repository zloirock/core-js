import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
// Capturing a selected constructor retains candidates without proving either branch.
export function read(choice) {
  var _ref, _ref2;
  return null == (_ref = choice ? Array : null) ? void 0 : _at(_ref2 = (_ref === Array ? _Array$from : _ref.from.bind(_ref))([3])).call(_ref2, 0);
}