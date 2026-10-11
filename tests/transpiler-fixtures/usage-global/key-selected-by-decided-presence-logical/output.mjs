import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.find-last-index";
import "core-js/modules/es.array.with";
// In usage-global a key a logical selection yields injects the method of each operand it may take: an
// `&&` over a test that holds always takes `findLast`, an `||` over one that fails always takes
// `findLastIndex`, and an `&&` the test always fails never reaches its `toSorted`. an undecided `&&`
// may take its right, so its `with` comes in too
const viaAnd = typeof Symbol === 'function' && 'findLast';
export const andRead = (list, fn) => list[viaAnd](fn);
const viaDeadTest = typeof Symbol == 'undefined' || 'findLastIndex';
export const orRead = (list, fn) => list[viaDeadTest](fn);
const neverReached = typeof Symbol === 'undefined' && 'toSorted';
export const falseRead = list => list[neverReached]();
const undecided = flag && 'with';
export const undecidedRead = list => list[undecided](0, 1);