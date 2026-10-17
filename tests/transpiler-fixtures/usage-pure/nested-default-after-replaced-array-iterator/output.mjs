import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A nested slot default does not identify what a changed iterator supplies.
// Global keeps the generic instance claim; pure retains native array destructuring.
Array.prototype[_Symbol$iterator] = function* () {
  yield 'xy';
};
const [{
  includes
} = [1]] = [];
export const result = includes.call('xy', 'xy');