// a polyfilled call hosted by a SpreadElement - array-literal element and call-argument
// positions. The readonly binding and string literal need no receiver snapshot,
// and both call results stay inside their surrounding spread.
const arr = [1, [2]];
export const a = [...arr.flat()];
function f(...xs) { return xs; }
export const b = f(...'abc'.at(0));
