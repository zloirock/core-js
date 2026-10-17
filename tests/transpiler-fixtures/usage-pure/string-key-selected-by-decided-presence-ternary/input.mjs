// a key a decided presence ternary selects is the arm it always takes: a string key claims its
// instance method, read off an alias or spelled in the member itself; the dead arm's key claims nothing
const key = typeof Symbol != 'undefined' ? 'at' : 'flat';
export const first = list => list[key](0);
export const last = list => list[typeof Symbol == 'undefined' ? 'toSorted' : 'findLast'](x => x);
