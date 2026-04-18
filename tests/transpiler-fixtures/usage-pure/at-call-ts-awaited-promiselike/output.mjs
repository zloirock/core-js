import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
declare const x: Awaited<PromiseLike<string[]>>;
_atMaybeArray(x).call(x, 0);