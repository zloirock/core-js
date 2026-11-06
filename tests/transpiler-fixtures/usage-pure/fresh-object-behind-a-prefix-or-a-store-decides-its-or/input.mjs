// A prefix or store does not change a fresh object's truthiness.
// The selected literal container retains native static reads, effects and stored identity.
export const { C: { groupBy } } = (console.log(), { C: Map }) || { C: Object };
let stash;
export const { C: { from } } = (stash = { C: Iterator }) || { C: Array };
let held;
export const { C: { of } } = (held = { C: Array }) || { C: Object };
let box, fromAsync;
({ C: { fromAsync } } = (box = { C: Array }) || { C: Object });
export { stash, held, box, fromAsync };
