import _at from "@core-js/pure/actual/instance/at";
var _ref;
// Indexed return substitution keeps a named argument conservative after an opaque handout.
function pick<T extends {
  rows: unknown;
}>(o: T): T["rows"] {
  return o.rows;
}
const box = {
  rows: [8, 9]
};
mutate(box);
use(_at(_ref = pick(box)).call(_ref, -1));