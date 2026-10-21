// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
const [{ Array: F }, { Promise: P }] = [globalThis, globalThis];
export const viaBothB = P.allSettled([]);
