// non-asserts ambient predicate (`x is string` rather than `asserts x is string`). same
// ambient-walk path as the asserts case; both forms must narrow correctly so the polyfill
// dispatch picks the precise string variant
declare function isStr(x: unknown): x is string;
function probe(x: unknown) {
  if (isStr(x)) {
    return x.at(0);
  }
  return null;
}
