// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Supplied values and defaults keep their source branches and independent claims.
function paramHop({ w: { Map: viaParamCtor } } = { w: globalThis }) {
  return viaParamCtor;
}
export default [paramHop()];
