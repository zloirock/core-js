// Closed true callers settle the conditional constructor aliases. Hoisted var declarations
// and plain writes serve the same direct statics; an instance-method name remains a property read.
function viaWrite(c) {
  let M;
  if (c) ({ Map: M } = globalThis);
  return M.groupBy([1, 2], x => x % 2);
}
function viaDecl(c) {
  if (c) { var { Promise: P } = globalThis; }
  return typeof P.try;
}
// An instance-method name stays a property read on the selected constructor.
function viaInstanceKey(c) {
  let S;
  if (c) ({ Set: S } = globalThis);
  return typeof S.union;
}
export const r = [viaWrite(true), viaDecl(true), viaInstanceKey(true)];
