// a ternary over a presence test the build always answers is the arm it always takes: an alias
// declared or assigned from it, a key its arms write, the key spelled in the member itself. an
// undecided ternary may yield the fallback, so its reads stay native
const declared = typeof Symbol != 'undefined' ? Symbol.iterator : '@@iterator';
export const readDeclared = receiver => receiver[declared];
let assigned;
assigned = typeof Symbol == 'undefined' ? '@@iterator' : Symbol.iterator;
export const readAssigned = receiver => receiver[assigned];
let armWritten;
typeof Symbol == 'undefined' ? (armWritten = '@@iterator') : (armWritten = Symbol.iterator);
export const readArmWritten = receiver => receiver[armWritten];
export const readDirect = receiver => receiver[typeof Symbol != 'undefined' ? Symbol.iterator : '@@iterator'];
const undecided = flag ? Symbol.iterator : '@@iterator';
export const readUndecided = receiver => receiver[undecided];
export const readUndecidedDirect = receiver => receiver[flag ? Symbol.iterator : '@@iterator'];
