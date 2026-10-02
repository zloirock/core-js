import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// A literal-returning local function proves the computed key overrides inner.
// Nested indexed return substitution must use the resulting string slot.
function pick<T extends {
  inner: {
    rows: unknown;
  };
}>(o: T): T["inner"]["rows"] {
  return o.inner.rows;
}
function key() {
  return "inner";
}
use(_atMaybeString(_ref = pick({
  inner: {
    rows: [8, 9]
  },
  [key()]: {
    rows: "ab"
  }
})).call(_ref, -1));