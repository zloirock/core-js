import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// the write-free default still narrows precisely (local fn - every call site visible
// and omits the arg, so the default's type is the runtime value)
function cleanDefault(x = [1, 2, 3]) {
  return _atMaybeArray(x).call(x, 0);
}
export const viaCleanDefault = cleanDefault();