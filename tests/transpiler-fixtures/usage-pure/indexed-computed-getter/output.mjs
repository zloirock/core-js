import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// A literal-returning local function proves the computed getter key overrides rows.
// Indexed return substitution must use the getter's string result.
function pick<T extends {
  rows: unknown;
}>(o: T): T["rows"] {
  return o.rows;
}
function key() {
  return "rows";
}
use(_atMaybeString(_ref = pick({
  rows: [8, 9],
  get [key()]() {
    return "ab";
  }
})).call(_ref, -1));