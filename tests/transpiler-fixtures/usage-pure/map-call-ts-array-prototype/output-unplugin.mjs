import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
function f(x: number[]) { _mapMaybeArray(x).call(x, String); }