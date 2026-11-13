import _Promise from "@core-js/pure/actual/promise/constructor";
// A quiet bound key keeps the ordinary optional realm-hop decision.
export function read() {
  function key() {
    return "self";
  }
  return typeof (key(), _Promise);
}