// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
let cache;
export const [[{ groupBy }]] = [(cache = [Map])];

let kept;
export const [{ allSettled }] = (kept = [Promise]);
