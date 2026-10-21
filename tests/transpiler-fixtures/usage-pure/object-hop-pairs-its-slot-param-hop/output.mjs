import _globalThis from "@core-js/pure/actual/global-this";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Supplied values and defaults keep their source branches and independent claims.
function paramHop({
  w: {
    Map: viaParamCtor
  }
} = {
  w: _globalThis
}) {
  return viaParamCtor;
}
export default [paramHop()];