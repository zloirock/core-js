// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
let closedAlias = globalThis;
function closeOver() {
  closedAlias = self;
}
const { w: { Array: { from: viaClosedAlias } } } = { w: closedAlias };

export default [viaClosedAlias, closeOver];
