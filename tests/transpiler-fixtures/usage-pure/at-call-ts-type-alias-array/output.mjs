import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
type Box<T> = Array<T>;
declare const b: Box<string>;
_atMaybeArray(b).call(b, -1);