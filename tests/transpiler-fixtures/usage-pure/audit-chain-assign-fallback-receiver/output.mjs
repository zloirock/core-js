import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
b = Array;
// chain-assignment within destructure receiver: `b = (A || B)` evaluates to its right-hand side, and the
// fallback-receiver peel alternates chain-assign + paren + TS + safe-SE peels until stable to reach the
// selection. `Array || Set` folds to its left, `Array` always yielding, as does a left the build serves off
// the realm (`globalThis.Number || Set`, a global core-js extends in place): the assignment stores that left
const from = _Array$from;
from;
c = _globalThis.Number;
const isInteger = _Number$isInteger;
isInteger;