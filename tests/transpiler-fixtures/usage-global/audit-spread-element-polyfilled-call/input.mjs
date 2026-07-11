// a polyfilled call hosted by a SpreadElement - array-literal element and call-argument
// positions both trigger the method injection plus the spread's own iterator machinery
const arr = [1, [2]];
export const a = [...arr.flat()];
function f(...xs) { return xs; }
export const b = f(...arr.at(0));
