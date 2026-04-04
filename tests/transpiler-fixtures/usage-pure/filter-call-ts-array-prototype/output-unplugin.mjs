import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
function f(x: number[]) { _filterMaybeArray(x).call(x, Boolean); }