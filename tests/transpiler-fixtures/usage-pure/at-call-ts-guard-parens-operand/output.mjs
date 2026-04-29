import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
function f(x: unknown) {
  if (x instanceof Array) _atMaybeArray(x).call(x, -1);
  if (Array.isArray(x)) _atMaybeArray(x).call(x, -1);
}