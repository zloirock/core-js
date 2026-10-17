// the REFUSED-alias guarded narrow renders for the SOLE-ASSIGNMENT host exactly as for the
// declarator host (`g = (se, M === _Map ? _Map$groupBy : M.groupBy)`) - the raw read off a
// claimed alias answered `undefined` where every engine with the ctor answers the member
let n = 0;
function t(c) {
  let M;
  if (c) ({ Map: M } = globalThis);
  let g;
  try {
    ({ groupBy: g } = (n++, M));
    return [typeof g, n];
  } catch (e) {
    return ['T', n];
  }
}
export const viaAssignment = [t(true), t(false)];
