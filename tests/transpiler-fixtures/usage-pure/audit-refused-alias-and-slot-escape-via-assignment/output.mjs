import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// the REFUSED-alias guarded narrow renders for the SOLE-ASSIGNMENT host exactly as for the
// declarator host (`g = (se, M === _Map ? _Map$groupBy : M.groupBy)`) - the raw read off a
// claimed alias answered `undefined` where every engine with the ctor answers the member
let n = 0;
function t(c) {
  let M;
  if (c) M = _Map;
  let g;
  try {
    g = (n++, M === _Map ? _Map$groupBy : M.groupBy);
    return [typeof g, n];
  } catch (e) {
    return ['T', n];
  }
}
export const viaAssignment = [t(true), t(false)];