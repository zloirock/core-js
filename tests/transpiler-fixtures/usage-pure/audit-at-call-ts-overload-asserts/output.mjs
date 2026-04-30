import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// TS overload signatures: the assertion predicate lives on a TSDeclareFunction sibling
// while the FunctionDeclaration impl has no return-type annotation. binding lookup picks
// the impl (no predicate); predicate resolver must continue to ambient sibling search to
// recover the narrowing from the overload header
function assertString(x: unknown): asserts x is string;
function assertString(x: unknown) {}
function probe(x: unknown) {
  assertString(x);
  return _atMaybeString(x).call(x, 0);
}