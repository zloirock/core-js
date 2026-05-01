import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Required<T> wraps T — Required<{data: number[]}>.data should resolve through to number[].
type Inner = { data?: number[] };
declare const r: Required<Inner>;
_atMaybeArray(_ref = r.data).call(_ref, 0);