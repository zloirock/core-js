// a binding holding a selection of containers the build decides holds the container the selection yields,
// its test asked where the declaration stands even from a closure shadowing a name it reads; so a slot
// write that runs before every read replaces that container's slot as it does a plain container's: the
// replaced value's static is not loaded - written directly or through an alias, or read in a closure
const direct = typeof Symbol != 'undefined' ? { C: Map } : { C: Set };
direct.C = Object;
export const grouped = direct.C.groupBy([1, 2], x => x % 2);
const viaAlias = { C: Array } || { C: Set };
const alias = viaAlias;
alias.C = Iterator;
export const listed = viaAlias.C.from([1]);
const deferred = typeof Symbol != 'undefined' ? { C: Int16Array } : { C: Set };
deferred.C = Array;
export function count(n) {
  return deferred.C.of(n);
}
const shadowed = typeof Symbol != 'undefined' ? { C: Reflect } : { C: Object };
export function protoOf(Symbol, value) {
  return shadowed.C.getPrototypeOf(value);
}
