import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// chain with TRAILING optional call: `arr?.at?.(1).includes?.(2)`. the outermost call
// is `.includes?.(2)` (optional call on `.includes` member access); chain detection must
// preserve the trailing `?.()` so a null/undefined `.includes` short-circuits to undefined
// instead of throwing. emit wraps the conditional in `(...)?.()` to propagate the chain
// optionality through the whole substituted form
const arr = [1, 2];
arr == null ? void 0 : _atMaybeArray(arr)?.call(arr, 1).includes?.(2);