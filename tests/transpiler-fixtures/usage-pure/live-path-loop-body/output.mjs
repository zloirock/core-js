import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _entries from "@core-js/pure/actual/instance/entries";
import _values from "@core-js/pure/actual/instance/values";
// Moving the loop pattern keeps the declaration before its later assignment.
export function collect(forms) {
  const seen = [];
  for (const _ref of forms) {
    const values = _values(_ref);
    const {
      meta
    } = _ref;
    let entries, status;
    entries = _entries(meta.data);
    ({
      status
    } = meta);
    _pushMaybeArray(seen).call(seen, values, entries, status);
  }
  return seen;
}