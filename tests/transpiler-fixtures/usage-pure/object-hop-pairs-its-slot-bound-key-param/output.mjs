import _globalThis from "@core-js/pure/actual/global-this";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Supplied values and defaults keep their source branches and independent claims.
const hopKey = 'w';
function boundKeyParam({
  [hopKey]: {
    Map: viaBoundKeyParam
  }
} = {
  w: _globalThis
}) {
  return viaBoundKeyParam;
}
export default [boundKeyParam()];