import _globalThis from "@core-js/pure/actual/global-this";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Supplied values and defaults keep their source branches and independent claims.
{
  const {
    w: {
      Map: M = fb
    }
  } = {
    w: _globalThis
  };
  M();
}