// A `||` whose left is an `&&` or a conditional the build decides to an object literal never runs its
// right: the literal is always truthy. usage-pure folds the selection to that literal, and a static read
// through its slot takes the left's constructor alone, whether the selection is held in a const or read
// in place
const box = typeof Symbol != 'undefined' && { C: Map } || { C: Object };
export const held = () => box.C.groupBy([1], x => x);
export const inPlace = x => (typeof Promise != 'undefined' && { R: Reflect } || { R: Object }).R.isExtensible(x);
export const ternary = () => ((typeof WeakMap != 'undefined' ? { A: Array } : null) || { A: Int8Array }).A.of(1);
