import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// An open caller keeps its parameter pattern. A mirrored default serves the static
// while its native sibling getter still runs after the computed key.
const events = [];
export function read([{
  Array: {
    of
  },
  [(_pushMaybeArray(events).call(events, 'key'), 'sibling')]: value
} = {
  Array: {
    of: _Array$of
  },
  get sibling() {
    return _globalThis.sibling;
  }
}]) {
  return [of, value];
}