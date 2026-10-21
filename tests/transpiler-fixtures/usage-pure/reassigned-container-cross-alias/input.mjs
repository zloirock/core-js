// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
let first = { x: Number };
let second = { x: String };
first = second;
second = first;
const { x: { raw } } = first;
