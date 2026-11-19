import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Record<K, V> with V being a tuple should expose array methods through value access
type Dict = Record<string, [number, string]>;
declare const d: Dict;
_atMaybeArray(_ref = d["k"]).call(_ref, 0);