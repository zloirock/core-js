// proxy-global nested flatten with TWO residual siblings, each default holding a DIFFERENT
// instance call. both residual defaults (`a` -> `[1].at(0)`, `b` -> `[2].flat()`) must be
// polyfilled in place; their rewrites land independently in the rebuilt destructure,
// and `from` is the flatten extraction
var { Array: { from }, a = [1].at(0), b = [2].flat() } = globalThis;
from([3]);
a;
b;
