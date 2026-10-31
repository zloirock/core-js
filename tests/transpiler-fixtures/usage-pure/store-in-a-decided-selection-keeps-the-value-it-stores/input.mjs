// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
var stash;
export const { C: { groupBy } } = typeof Symbol != 'undefined' ? (stash = { C: Map }) : { C: Object };
var held;
let from;
({ C: { from } } = typeof Symbol != 'undefined' ? (held = { C: Array }) : { C: Object });
export { stash, held, from };
