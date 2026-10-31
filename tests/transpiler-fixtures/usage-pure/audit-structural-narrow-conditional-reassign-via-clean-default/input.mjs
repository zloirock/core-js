// the write-free default still narrows precisely (local fn - every call site visible
// and omits the arg, so the default's type is the runtime value)
function cleanDefault(x = [1, 2, 3]) {
  return x.at(0);
}
export const viaCleanDefault = cleanDefault();
