import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
function dfl(a = [1]) {
  return a;
}
const viaDefaultOverridden = dfl(...[[2]]);
(_findLastMaybeArray(viaDefaultOverridden) || 0).call(viaDefaultOverridden, Boolean);
_atMaybeArray(viaDefaultOverridden).call(viaDefaultOverridden, 0);
export { viaDefaultOverridden };