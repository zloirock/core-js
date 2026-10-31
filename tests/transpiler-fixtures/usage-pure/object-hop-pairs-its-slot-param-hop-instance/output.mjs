import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
function paramHopInstance(_ref = {
  w: [1, 2]
}) {
  let viaParamInstance = _atMaybeArray(_ref.w);
  return viaParamInstance;
}
export default [paramHopInstance()];