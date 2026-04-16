import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
function first<const T extends readonly unknown[]>(xs: T) {
  return _atMaybeArray(xs).call(xs, 0);
}
first(['a', 'b', 'c']);