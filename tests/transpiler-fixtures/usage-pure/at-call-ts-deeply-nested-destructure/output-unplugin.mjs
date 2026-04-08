import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
declare const data: { a: { b: { c: { d: number[] } } } };
const { a: { b: { c: { d } } } } = data;
_atMaybeArray(d).call(d, -1);