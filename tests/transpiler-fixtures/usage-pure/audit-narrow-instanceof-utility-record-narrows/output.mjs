import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Record<K, V> is an open utility-type surface, so instanceof Array narrows it
// to a concrete Array. Method `at` is shared by string and array so the polyfill
// import alone identifies that the instanceof refinement selected the Maybe-array
// variant.
function probe(input: Record<string, unknown>) {
  if (input instanceof Array) return _atMaybeArray(input).call(input, 0);
  return null;
}
probe();