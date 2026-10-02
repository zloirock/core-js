// A literal-returning local function proves the computed key overrides inner.
// Nested indexed return substitution must use the resulting string slot.
function pick<T extends { inner: { rows: unknown } }>(o: T): T["inner"]["rows"] {
  return o.inner.rows;
}
function key() {
  return "inner";
}
use(pick({ inner: { rows: [8, 9] }, [key()]: { rows: "ab" } }).at(-1));
