// mixed nullable + concrete returns: explicit `return null` and bare `return;` both
// stay OUT of the common-type merge (so `null | Array` doesn't fold to null), but
// explicit null is recorded as a nullable fallback. a non-nullable branch wins the
// merge; if ALL branches are nullable the fallback surfaces instead of collapsing to
// undefined. here Array survives - `.at(0)` dispatches the array path.
function probe(cond) {
  if (cond) return null;
  return [1, 2, 3];
}
probe(true).at(0);
