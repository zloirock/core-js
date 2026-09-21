import _Promise$all from "@core-js/pure/actual/promise/all";
// A stored pure constructor stays separate from the native global.
// Pure mode still supplies its missing static.
import P from "@core-js/pure/actual/promise/constructor";
const box = {
  P
};
export const all = _Promise$all;