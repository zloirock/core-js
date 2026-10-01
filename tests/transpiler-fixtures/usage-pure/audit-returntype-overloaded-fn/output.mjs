import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `ReturnType<typeof overloaded>` must follow TS semantics and pick the last public overload.
// Last overload here is `string[]`, so `r.at?.(0)` narrows to the array polyfill.
declare function fn(): number;
declare function fn(): string[];
type R = ReturnType<typeof fn>;
declare const r: R;
_atMaybeArray(r)?.call(r, 0);