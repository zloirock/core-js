// a polyfilled call hosted by a SpreadElement - array-literal element and call-argument
// positions. the rewrite composes INSIDE the spread; a call-rooted receiver memoizes
// without disturbing the surrounding `...`
const arr = [1, [2]];
export const a = [...arr.flat()];
function f(...xs) { return xs; }
export const b = f(...'abc'.at(0));
