import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// rest param used inside the function body - call-site fallback inference should see
// `...xs` as an Array so `.at(0)` dispatches to the Array-specific helper
function first(...xs) {
  return _atMaybeArray(xs).call(xs, 0);
}
first(1, 2, 3);