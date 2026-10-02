import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Throwing into a local catch keeps the container in this execution.
// Unused and read-only catch bindings do not invalidate positional array receivers.
const rows = [[1, 2]];
try {
  throw rows;
} catch (e) {
  void e.length;
}
const [_ref] = rows;
const at = _atMaybeArray(_ref);
use(at);