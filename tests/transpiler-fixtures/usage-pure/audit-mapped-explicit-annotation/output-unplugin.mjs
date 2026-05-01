import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Explicit annotation with mapped-passthrough type — should resolve T into the body's T[K]
type Copy<T> = { [K in keyof T]: T[K] };
declare const r: Copy<{ data: number[] }>;
_atMaybeArray(_ref = r.data).call(_ref, 0);