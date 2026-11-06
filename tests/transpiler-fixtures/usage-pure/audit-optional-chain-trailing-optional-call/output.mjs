import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// chain with a TRAILING optional call on a non-polyfilled member: `arr?.at?.(1).includes?.(2)`.
// the `.includes?.(2)` must stay attached to the polyfilled inner result INSIDE the conditional
// alternate so `this` for `.includes` binds to the at-result; lifting it into the conditional
// test would call with `this === undefined` and throw. the trailing `?.()` stays optional.
const arr = [1, 2];
arr == null ? void 0 : _atMaybeArray(arr)?.call(arr, 1).includes?.(2);