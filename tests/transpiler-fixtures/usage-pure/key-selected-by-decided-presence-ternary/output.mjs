import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a ternary over a presence test the build always answers is the arm it always takes: an alias
// declared or assigned from it, a key its arms write, the key spelled in the member itself. an
// undecided ternary may yield the fallback, so its reads stay native
const declared = _Symbol$iterator;
export const readDeclared = receiver => _getIteratorMethod(receiver);
let assigned;
assigned = _Symbol$iterator;
export const readAssigned = receiver => _getIteratorMethod(receiver);
let armWritten;
armWritten = _Symbol$iterator;
export const readArmWritten = receiver => _getIteratorMethod(receiver);
export const readDirect = receiver => _getIteratorMethod(receiver);
const undecided = flag ? _Symbol$iterator : '@@iterator';
export const readUndecided = receiver => receiver[undecided];
export const readUndecidedDirect = receiver => receiver[flag ? _Symbol$iterator : '@@iterator'];