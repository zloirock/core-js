// a catch parameter binds a value no host spells, so an element's default alone names the receiver:
// usage-global loads the statics of the live operand of a selection the build decides there, and none of
// the dead operand's
export function viaDecidedElement(g) {
  try { g(); } catch ([{ of } = typeof Symbol != 'undefined' ? Array : Set]) { return of; }
}
