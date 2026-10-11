// a `||` whose left yields a fresh object behind an effect prefix or a store decides for that left, as
// the fresh object spelled alone does: the right never runs, so its arm names nothing - each leaf loads
// its left's static alone, in a declaration and an assignment alike, though every right names modules
export const { C: { groupBy } } = (console.log(), { C: Map }) || { C: Object };
let stash;
export const { C: { from } } = (stash = { C: Iterator }) || { C: Array };
let held;
export const { C: { of } } = (held = { C: Array }) || { C: Int8Array };
let box, fromAsync;
({ C: { fromAsync } } = (box = { C: Array }) || { C: WeakSet });
export { fromAsync };
