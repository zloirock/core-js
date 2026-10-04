import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A nullable array-producing call in a parameter default can yield null.
// Capturing that receiver throws before its computed key or the function body.
let keys = 0;
function built() {
  return JSON.parse('true') ? null : [1, [2]];
}
function read(at, flat, value = (() => {
  var _ref;
  return _ref = built(), null == _ref ? _ref[""] : (keys++, at = _atMaybeArray(_ref)), flat = _flatMaybeArray(_ref), _ref;
})()) {
  return value;
}
export const result = (() => {
  try {
    read();
  } catch (error) {
    return [error instanceof TypeError, keys];
  }
})();