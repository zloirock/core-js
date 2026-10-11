// In usage-global a key a decided presence ternary selects injects the method of the arm it always
// takes and nothing of the dead one: `at` and `findLast` come in, the dead `flat` and `toSorted` do not -
// read off an alias or spelled in the member itself
const key = typeof Symbol != 'undefined' ? 'at' : 'flat';
export const first = list => list[key](0);
export const last = list => list[typeof Symbol == 'undefined' ? 'toSorted' : 'findLast'](x => x);
