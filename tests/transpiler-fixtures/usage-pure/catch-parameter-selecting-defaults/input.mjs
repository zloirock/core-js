// A catch default selects the arm that actually runs and serves supported direct statics.
// Selections of literal containers keep native slot reads and full constructor values.
export function viaDecided(g) {
  try { g(); } catch ({ W: { allSettled } = typeof Symbol != 'undefined' ? Promise : Object }) { return allSettled; }
}
export function viaUndecided(g) {
  try { g(); } catch ({ W: { groupBy } = c ? Map : Object }) { return groupBy; }
}
export function viaUndecidedContainer(g) {
  try { g(); } catch ({ W: { C: { from } } = c ? { C: Array } : { C: Iterator } }) { return from; }
}
