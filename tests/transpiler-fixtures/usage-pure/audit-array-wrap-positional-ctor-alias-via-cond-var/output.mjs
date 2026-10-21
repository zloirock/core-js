import _globalThis from "@core-js/pure/actual/global-this";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
function condVar(c) {
  if (c) {
    var [{
      Iterator: CB
    }] = [_globalThis];
  }
  return CB && CB.range(0, c);
}
export const viaCondVar = condVar(cond);