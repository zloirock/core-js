import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// Two-level TS mapped passthrough `MyWrap<T> -> Copy<T> -> { [K in keyof T]: T[K] }`.
// For `MyWrap<string[]>`, the mapped type passes the array type through unchanged,
// so `.at(0)` and `.flat()` resolve to the array-specific polyfills.
type Copy<T> = { [K in keyof T]: T[K] };
type MyWrap<T> = Copy<T>;
declare const a: MyWrap<string[]>;
_atMaybeArray(a).call(a, 0);
_flatMaybeArray(a).call(a);