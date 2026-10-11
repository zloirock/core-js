// A catch parameter binds a value no host spells, so the default alone is mirrored where it fires: a
// selection the build decides mirrors its live operand, an undecided one every arm - flat and through a
// container level alike.
export function viaDecided(g) {
  try { g(); } catch ({ W: { allSettled } = typeof Symbol != 'undefined' ? Promise : Object }) { return allSettled; }
}
export function viaUndecided(g) {
  try { g(); } catch ({ W: { groupBy } = c ? Map : Object }) { return groupBy; }
}
export function viaUndecidedContainer(g) {
  try { g(); } catch ({ W: { C: { from } } = c ? { C: Array } : { C: Iterator } }) { return from; }
}
