// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
var stash;
export const { C: { groupBy } } = typeof Symbol != 'undefined' && (stash = { C: Map });
var kept;
let of;
({ C: { of } } = typeof Symbol != 'undefined' && (kept = { C: Array }));
export { stash, kept, of };
