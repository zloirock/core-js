import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// mixed nullable + concrete returns. an explicit `return null` carries an
// intentional null type rather than the implicit `undefined` of a bare
// `return;`; both kinds stay OUT of the commonType merge (so `null | Array`
// doesn't fold to null), but the explicit null is recorded as a nullable
// fallback. when at least one non-nullable branch contributes, the merged
// concrete type wins; when ALL branches are nullable, the fallback surfaces
// instead of collapsing to `$Primitive('undefined')`. covers the regression that
// could re-emerge if explicit nullable returns were treated identically to bare
// `return;`. here Array survives the merge - `.at(0)` dispatches the array path
function probe(cond) {
  if (cond) return null;
  return [1, 2, 3];
}
_atMaybeArray(_ref = probe(true)).call(_ref, 0);