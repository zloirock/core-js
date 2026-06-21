// user-aliased global called without `new` (constructor coercion path):
// `const A = Array; A(3)` -> `Array(3)` -> `[, , ,]`. call-type resolution must walk the
// const alias to recognise `A(3)` as `Array(3)`, so the return type is Array and the
// downstream `.at(0)` dispatches the Array-specific helper.
const A = Array;
const arr = A(3);
arr.at(0);
