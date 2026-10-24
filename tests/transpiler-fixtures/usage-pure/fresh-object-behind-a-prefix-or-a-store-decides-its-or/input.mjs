// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
export const { C: { groupBy } } = (console.log(), { C: Map }) || { C: Object };
let stash;
export const { C: { from } } = (stash = { C: Iterator }) || { C: Array };
let held;
export const { C: { of } } = (held = { C: Array }) || { C: Object };
let box, fromAsync;
({ C: { fromAsync } } = (box = { C: Array }) || { C: Object });
export { stash, held, box, fromAsync };
