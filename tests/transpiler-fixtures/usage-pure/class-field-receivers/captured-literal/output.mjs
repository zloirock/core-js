import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A field's destructuring assignment retains its literal receiver before the effectful key.
// Both claimed methods read that receiver and the field keeps the original assignment value.
let at;
let flat;
let keys = 0;
class Box {
  value = (() => {
    var _ref;
    return _ref = [1, [2]], keys++, at = _atMaybeArray(_ref), flat = _flatMaybeArray(_ref), _ref;
  })();
}
const box = new Box();
export const result = [at.call(box.value, 0), flat.call(box.value), keys];