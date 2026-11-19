import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
// A nested literal extraction precedes the following computed receiver and its residual.
const rows = [3, 7];
if (enabled) {
  const first = before(),
    at = _atMaybeArray(rows);
  const _ref = makeRows();
  const other = _at(_ref);
  const {
    length
  } = _ref;
  use(first, at, other, length);
}