// a catch parameter binds a value no host spells, so an element's default alone is mirrored where it
// fires: a selection the build decides there mirrors its live operand and keeps none of the dead one
export function viaDecidedElement(g) {
  try { g(); } catch ([{ of } = typeof Symbol != 'undefined' ? Array : Set]) { return of; }
}
