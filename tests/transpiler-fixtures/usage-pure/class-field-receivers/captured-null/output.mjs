import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A nullable array-producing call in an instance field can yield null.
// Capturing that receiver throws before its computed key while initializing the field.
let at;
let flat;
let keys = 0;
function built() {
  return JSON.parse('true') ? null : [1, [2]];
}
class Box {
  value = (() => {
    var _ref;
    return _ref = built(), null == _ref ? _ref[""] : (keys++, at = _atMaybeArray(_ref)), flat = _flatMaybeArray(_ref), _ref;
  })();
}
export const result = (() => {
  try {
    new Box();
  } catch (error) {
    return [error instanceof TypeError, keys];
  }
})();