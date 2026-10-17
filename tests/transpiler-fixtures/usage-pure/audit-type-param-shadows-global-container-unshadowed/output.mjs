import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
function unshadowed<T extends number[]>(x: T) {
  return _findMaybeArray(x).call(x, n => n > 0);
}