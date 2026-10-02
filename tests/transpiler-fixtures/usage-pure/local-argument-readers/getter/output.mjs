import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Reading a getter through a local helper preserves its returned array type.
function pick<T extends {
  rows: unknown;
}>(o: T): T["rows"] {
  return o.rows;
}
const box = {
  get rows() {
    effect();
    return [8, 9];
  }
};
use(_atMaybeArray(_ref = pick(box)).call(_ref, -1));