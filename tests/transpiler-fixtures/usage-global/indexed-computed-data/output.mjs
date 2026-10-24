import "core-js/modules/es.string.at";
// A literal-returning local function proves the computed key overrides rows.
// Indexed return substitution must use the resulting string type.
function pick<T extends {
  rows: unknown;
}>(o: T): T["rows"] {
  return o.rows;
}
function key() {
  return "rows";
}
use(pick({
  rows: [8, 9],
  [key()]: "ab"
}).at(-1));