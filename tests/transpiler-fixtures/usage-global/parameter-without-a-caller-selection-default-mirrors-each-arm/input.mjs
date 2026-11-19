// A parameter no call site fills binds a value no host spells, so an inner default holding an undecided
// selection is mirrored arm by arm where it fires, the parameter's own value left native - flat, and as
// a selection of containers on a level under the parameter's own default.
export function viaParameter({ W: { groupBy } = c ? Map : Object }) {
  return groupBy;
}
export function viaLevel({ W: { C: { from } } = c ? { C: Array } : { C: Iterator } } = {}) {
  return from;
}
