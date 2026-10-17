import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// A computed getter and trailing setter retain one accessor descriptor during indexed substitution.
function pick<T extends {
  rows: unknown;
}>(o: T): T["rows"] {
  return o.rows;
}
const key = "rows";
use(_atMaybeArray(_ref = pick({
  get [key]() {
    return [8, 9];
  },
  set rows(value) {}
})).call(_ref, -1));