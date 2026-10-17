import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
function dfl(a = [1]) {
  return a;
}
const viaDefaultOverridden = dfl(...[[2]]);
_findLastMaybeArray(viaDefaultOverridden).call(viaDefaultOverridden, Boolean);
export { viaDefaultOverridden };