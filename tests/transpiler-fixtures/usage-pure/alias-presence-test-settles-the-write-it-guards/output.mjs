import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// a presence test reading an alias decides the write it guards where the alias's value is settled too: the
// alias holds what the build serves when the test reads it, so the arm never runs and the binding keeps its
// first value
let M = _globalThis.Array;
if (!M) M = makeArray();
export const from = _Array$from;