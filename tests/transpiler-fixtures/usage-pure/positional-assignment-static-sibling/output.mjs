import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Object$keys from "@core-js/pure/actual/object/keys";
var _ref, _ref2;
// A positional capture keeps the preceding static claim live at its replacement path.
const array = [2, 7],
  rows = [Object, array];
let keys, at;
[_ref, _ref2] = rows;
const {
  keys: _unused
} = _ref;
keys = _Object$keys;
at = _atMaybeArray(_ref2);
export const result = [keys({
  x: 1
}), at.call(array, -1)];