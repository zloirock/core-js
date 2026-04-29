import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
type Box<T> = string | Array<T>;
function f(x: Box<number>) {
  if (typeof x !== 'string') _atMaybeArray(x).call(x, -1);
}