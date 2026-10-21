// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
const [{ Array: A }, tail] = [globalThis, 0];
const [{ Map: M }] = [globalThis];
export const r = [A.from([1, 2, 3]), typeof M.groupBy];
export const effects = tail;
