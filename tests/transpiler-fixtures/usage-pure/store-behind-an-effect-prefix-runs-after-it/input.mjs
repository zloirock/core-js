// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
var one, two;
export const { C: { groupBy } } = (setup(), one = { C: Map });
export const { C: { from }, D: { of } } = (setup(), two = { C: Array, D: Array });
export { one, two };
