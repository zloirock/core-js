import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Optional calls and parentheses keep the same local reader and argument.
function pick<T extends {
  rows: unknown;
}>(o: T): T["rows"] {
  return o.rows;
}
const box = {
  rows: [8, 9]
};
use(pick == null ? void 0 : _atMaybeArray(_ref = pick(box as typeof box)).call(_ref, -1));