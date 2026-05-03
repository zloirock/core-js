import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// non-ambient overload heads carry the predicate; impl signature does not. babel registers
// only the impl as the binding, and predicateCandidates walks findAmbientFunctionPaths
// which matches TSDeclareFunction / DeclareFunction only - non-ambient overload heads
// (FunctionDeclaration with body=null) are missed. expected: TS-flow narrows x to string
function isStr(x: unknown): x is string;
function isStr(x: unknown): boolean;
function isStr(x: unknown) {
  return typeof x === "string";
}
function probe(x: unknown) {
  if (isStr(x)) return _atMaybeString(x).call(x, 0);
  return null;
}