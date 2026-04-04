import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
function f(x: string[] | undefined) { _atMaybeArray(x) == null ? void 0 : _atMaybeArray(x).call(x, -1); }