// Each build-decided selection dispatches on its live operand after folding its dead arm. The final
// computed selection stays open and dispatches on the runtime receiver, preserving any own `with`.
// Unknown parameter-driven family selection remains covered by `mixed-static-instance-selection`.
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
