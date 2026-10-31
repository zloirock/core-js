// A `||` whose left is an `&&` or a conditional the build decides to an object literal never runs its
// right: the literal is always truthy. In usage-global the right's constructor brings nothing, whether
// the selection is held in a const or read in place. An undecided `&&` may yield its falsy test, so
// both containers stay live
const box = typeof Symbol != 'undefined' && { C: Map } || { C: Object };
export const held = () => box.C.groupBy([1], x => x);
export const inPlace = x => (typeof Promise != 'undefined' && { R: Reflect } || { R: Object }).R.isExtensible(x);
export const ternary = () => ((typeof WeakMap != 'undefined' ? { A: Array } : null) || { A: Int8Array }).A.of(1);
const open = flag && { I: Iterator } || { I: Array };
export const undecided = () => open.I.from([1]);
