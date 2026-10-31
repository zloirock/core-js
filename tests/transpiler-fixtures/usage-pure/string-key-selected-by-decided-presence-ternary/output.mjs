import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _at from "@core-js/pure/actual/instance/at";
// a key a decided presence ternary selects is the arm it always takes: a string key claims its
// instance method, read off an alias or spelled in the member itself; the dead arm's key claims nothing
const key = 'at';
export const first = list => _at(list).call(list, 0);
export const last = list => _findLastMaybeArray(list).call(list, x => x);