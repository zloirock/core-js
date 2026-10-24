import _Promise$all from "@core-js/pure/actual/promise/all";
// Returning a pure constructor does not make it the native global.
// Pure mode still supplies its missing static and keeps the call effect.
import P from "@core-js/pure/actual/promise/constructor";
function get() {
  hit();
  return P;
}
export const all = (get(), _Promise$all);