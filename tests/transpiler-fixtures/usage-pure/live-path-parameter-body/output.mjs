import _entries from "@core-js/pure/actual/instance/entries";
import _values from "@core-js/pure/actual/instance/values";
// Capturing a parameter keeps the following body bindings in their own slots.
export function read(_ref, state, _unused = void 0) {
  let values = _values(_ref);
  let entries, status;
  entries = _entries(state.data);
  ({
    status
  } = state);
  return [values, entries, status];
}