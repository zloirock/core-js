import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Baseline mapped passthrough without modifiers  -  should resolve subst correctly to Array
type Copy<T> = { [K in keyof T]: T[K] };
declare function probe<T>(arg: T): Copy<T>;
const r = probe<{ data: number[] }>(null!);
_atMaybeArray(_ref = r.data).call(_ref, 0);