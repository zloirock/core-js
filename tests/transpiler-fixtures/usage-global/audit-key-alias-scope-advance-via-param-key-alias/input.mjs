// NEGATIVE: an alias of the PARAM is an arbitrary caller value - the computed dispatch
// keeps its own guard
const j = 'from';
export function viaParamKeyAlias(j) {
  const p = j;
  return Array[p]?.([2]);
}
