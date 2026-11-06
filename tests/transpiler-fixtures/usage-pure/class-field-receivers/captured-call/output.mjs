import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A field's destructuring assignment evaluates its array-producing call once before the key.
// Both claimed methods read that receiver and the field keeps the original assignment value.
let at;
let flat;
let calls = 0;
let keys = 0;
function built() {
  return [++calls, [2]];
}
class Box {
  value = (() => {
    var _ref;
    return _ref = built(), null == _ref ? _ref[""] : (keys++, at = _atMaybeArray(_ref)), flat = _flatMaybeArray(_ref), _ref;
  })();
}
const box = new Box();
export const result = [at.call(box.value, 0), flat.call(box.value), calls, keys];