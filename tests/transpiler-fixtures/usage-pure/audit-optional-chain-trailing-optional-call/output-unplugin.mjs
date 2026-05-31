import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// chain with a TRAILING optional call on a non-polyfilled member: `arr?.at?.(1).includes?.(2)`.
// the `.includes?.(2)` must stay attached to the polyfilled inner result INSIDE the conditional
// alternate (`c ? void 0 : _at(arr)?.call(arr, 1).includes?.(2)`) so `this` for `.includes` binds
// to the at-result. lifting `.includes` into the conditional test (`(c ? void 0 :
// (...).includes)?.(2)`) would detach it and call with `this === undefined` - it throws where
// native returns a value. the trailing `?.()` stays optional so a nullish `.includes`
// short-circuits to undefined.
const arr = [1, 2];
arr == null ? void 0 : _atMaybeArray(arr)?.call(arr, 1).includes?.(2);