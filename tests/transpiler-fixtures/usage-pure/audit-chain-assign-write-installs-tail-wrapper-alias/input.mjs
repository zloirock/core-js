// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
let wrap = [Object], w2;
wrap = w2 = [Promise];
const [{ allSettled }] = wrap;
export const wrapperAlias = allSettled.call(Promise, []);
