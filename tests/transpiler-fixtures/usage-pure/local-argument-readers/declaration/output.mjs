import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// A local property reader preserves the named argument's array type.
function pick<T extends {
  rows: unknown;
}>(o: T): T["rows"] {
  return o.rows;
}
const box = {
  rows: [8, 9]
};
use(_atMaybeArray(_ref = pick(box)).call(_ref, -1));