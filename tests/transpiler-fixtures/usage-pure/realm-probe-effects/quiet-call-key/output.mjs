import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// An effect-free local call names the realm hop of a nested static read.
export function read() {
  function key() {
    return "self";
  }
  return typeof (key(), _Promise$resolve);
}