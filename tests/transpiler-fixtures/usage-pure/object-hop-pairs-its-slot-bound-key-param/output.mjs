import _globalThis from "@core-js/pure/actual/global-this";
// A bound computed key selects its literal-container parameter slot.
// The nested Map read remains native when the default fires.
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