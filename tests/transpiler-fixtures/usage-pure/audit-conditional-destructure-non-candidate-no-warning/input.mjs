// A decided selection of constructors without this static keeps the native read.
// Debug output must not report an untouched polyfillable branch.
const cond = true;
const { from } = cond ? Set : WeakMap;
from([1, 2, 3]);
