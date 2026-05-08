import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Call returning mapped-passthrough  -  `probe<{data: number[]}>()` returns `Copy<T>`.
// Direct method call on the result: `probe<...>().data.at(0)`  -  does it resolve through Copy<T>?
type Copy<T> = { [K in keyof T]: T[K] };
declare function probe<T>(arg: T): Copy<T>;
_atMaybeArray(_ref = probe<{ data: number[] }>(null!).data).call(_ref, 0);