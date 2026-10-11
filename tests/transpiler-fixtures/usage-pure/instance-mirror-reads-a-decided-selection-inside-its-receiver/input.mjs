// an instance method a parameter default or an IIFE argument mirrors dispatches on its receiver with every
// selection the build decides inside it read by its live operand, as that receiver spelled without it: a
// computed key, an element, a member object, a hop slot, the argument itself and a `||` left. a selection
// the build leaves open in a computed key keeps the read native, as any unproven key does
export function key({ at } = o[typeof Symbol != 'undefined' ? 'a' : 'b']) {
  return at;
}
export function element({ toReversed } = [typeof Symbol != 'undefined' ? 1 : 2]) {
  return toReversed;
}
export function object({ findLast } = (typeof Symbol != 'undefined' ? o : p).arr) {
  return findLast;
}
export function hop({ C: { flat } } = { C: o[typeof Symbol != 'undefined' ? 'a' : 'b'] }) {
  return flat;
}
export const argument = (({ includes }) => includes)(typeof Symbol != 'undefined' ? arr : user);
export function left({ toSorted } = (typeof Symbol != 'undefined' ? arr : user) || other) {
  return toSorted;
}
export function open({ with: replaced } = o[c ? 'a' : 'b']) {
  return replaced;
}
