// chain-assignment within destructure receiver: `b = (A || B)` evaluates to its right-hand side, and the
// fallback-receiver peel alternates chain-assign + paren + TS + safe-SE peels until stable to reach the
// selection. `Array || Set` folds to its left, `Array` always yielding, as does a left the build serves off
// the realm (`globalThis.Number || Set`, a global core-js extends in place): the assignment stores that left
const { from } = (b = (Array || Set));
from;
const { isInteger } = (c = (globalThis.Number || Set));
isInteger;
