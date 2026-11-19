import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
let undecided;
if (flag) undecided = 'values';else undecided = _Symbol$iterator;
export const readUndecided = receiver => receiver[undecided];