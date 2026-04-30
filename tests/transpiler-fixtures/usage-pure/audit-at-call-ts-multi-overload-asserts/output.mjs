import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// 3+ overload siblings where the assertion predicate is NOT on the first header. single-
// match ambient walk would pick the boolean-returning overload and miss the asserts;
// collecting all ambient siblings recovers the predicate of interest
function isStr(x: number): boolean;
function isStr(x: unknown): asserts x is string;
function isStr(x: unknown) {}
function probe(x: unknown) {
  isStr(x);
  return _atMaybeString(x).call(x, 0);
}