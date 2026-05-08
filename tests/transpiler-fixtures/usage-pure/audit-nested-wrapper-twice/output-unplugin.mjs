import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Nested structure-preserving wrapper: `Readonly<Required<{ data: number[] }>>`  -  both wrappers transparent
type Inner = { data: number[] };
type Wrapped = Readonly<Required<Inner>>;
declare const w: Wrapped;
_atMaybeArray(_ref = w.data).call(_ref, 0);