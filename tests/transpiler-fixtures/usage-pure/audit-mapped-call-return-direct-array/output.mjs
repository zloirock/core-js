import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Same call-return shape as audit-p17a01-mapped-call-return but operating on Copy<string[]> directly.
// arr is the array itself — no nested member, no findTypeMember step.
type Copy<T> = { [K in keyof T]: T[K] };
declare function probe<T>(arg: T): Copy<T>;
const arr = probe<string[]>(null!);
_atMaybeArray(arr).call(arr, 0);