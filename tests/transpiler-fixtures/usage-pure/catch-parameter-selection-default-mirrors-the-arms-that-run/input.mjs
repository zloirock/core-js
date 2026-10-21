// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Supplied values and defaults keep their source branches and independent claims.
export function viaDecided(g) {
  try { g(); } catch ({ W: { allSettled } = typeof Symbol != 'undefined' ? Promise : Object }) { return allSettled; }
}
export function viaUndecided(g) {
  try { g(); } catch ({ W: { groupBy } = c ? Map : Object }) { return groupBy; }
}
export function viaUndecidedContainer(g) {
  try { g(); } catch ({ W: { C: { from } } = c ? { C: Array } : { C: Iterator } }) { return from; }
}
