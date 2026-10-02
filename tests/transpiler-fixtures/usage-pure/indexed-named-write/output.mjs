import _at from "@core-js/pure/actual/instance/at";
var _ref;
// Indexed return substitution must account for writes to a named argument's slot.
// An any annotation permits a runtime string replacement of the initial array.
function pick<T extends {
  rows: unknown;
}>(o: T): T["rows"] {
  return o.rows;
}
const box: any = {
  rows: [8, 9]
};
box.rows = "ab";
use(_at(_ref = pick(box)).call(_ref, -1));