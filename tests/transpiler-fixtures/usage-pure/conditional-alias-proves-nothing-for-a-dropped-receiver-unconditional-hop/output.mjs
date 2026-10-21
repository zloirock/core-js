import _globalThis from "@core-js/pure/actual/global-this";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
export function unconditionalHop() {
  var G = _globalThis;
  const {
    w: {
      Object: {
        values
      }
    }
  } = {
    w: G
  };
  return values({
    b: 2
  });
}