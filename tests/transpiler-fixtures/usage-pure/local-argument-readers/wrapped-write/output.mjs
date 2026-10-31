import _at from "@core-js/pure/actual/instance/at";
var _ref;
// TypeScript wrappers preserve the writes visible through the named argument.
function pick<T extends {
  rows: unknown;
}>(o: T): T["rows"] {
  return o.rows;
}
const box: any = {
  rows: [8, 9]
};
box.rows = "ab";
use(_at(_ref = pick(box as typeof box)).call(_ref, -1));