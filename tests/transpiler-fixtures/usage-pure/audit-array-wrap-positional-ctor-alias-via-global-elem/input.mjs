// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
const userObj = { Set: function () {} };
const [{ Set: A }, { Map: M }] = [userObj, globalThis];
export const viaGlobalElem = M.groupBy([], x => x);
