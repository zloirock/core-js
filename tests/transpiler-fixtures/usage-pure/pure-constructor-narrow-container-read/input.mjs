// A stored pure constructor stays separate from the native global.
// Pure mode still supplies its missing static.
import P from "@core-js/pure/actual/promise/constructor";
const box = { P };
export const all = box.P.all;
