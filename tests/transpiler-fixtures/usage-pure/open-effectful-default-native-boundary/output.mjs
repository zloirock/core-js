import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// An open caller cannot move its parameter pattern into the body. A native sibling read
// after a key effect keeps this default native; its static may lack a pure polyfill.
const events = [];
export function read([{
  Array: {
    of
  },
  [(_pushMaybeArray(events).call(events, 'key'), 'sibling')]: value
} = _globalThis]) {
  return [of, value];
}