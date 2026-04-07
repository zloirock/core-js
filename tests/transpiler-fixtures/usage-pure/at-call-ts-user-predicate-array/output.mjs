import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// regression: user-defined type predicate targeting a constructor-bearing type
// (`x is unknown[]`) now builds an equivalent instanceof guard via the
// resolved type's `constructor`. expect `_atMaybeArray`.
function isArr(x: unknown): x is unknown[] {
  return Array.isArray(x);
}
function f(x: unknown) {
  if (isArr(x)) return _atMaybeArray(x).call(x, 0);
}