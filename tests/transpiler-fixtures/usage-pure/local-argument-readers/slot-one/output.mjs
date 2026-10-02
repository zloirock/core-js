import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// The reader pairs its parameter with the second argument of this call.
function pick<T extends {
  rows: unknown;
}>(unused: unknown, o: T): T["rows"] {
  return o.rows;
}
const box = {
  rows: [8, 9]
};
use(_atMaybeArray(_ref = pick(0, box)).call(_ref, -1));