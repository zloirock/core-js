import _globalThis from "@core-js/pure/actual/global-this";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
{
  let hopSeq;
  ({
    w: {
      Array: {
        from: hopSeq
      }
    }
  } = {
    w: (f(), g(), _globalThis)
  });
  use(hopSeq);
}