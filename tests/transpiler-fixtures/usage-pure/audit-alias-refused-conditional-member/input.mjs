// a REFUSED ctor-alias registration (conditional write / conditional hoisted `var` decl) keeps
// the value swap and leaves member reads RAW: the untaken path throws on the undefined binding
// exactly like untranspiled code; an instance-method key stays in the raw residual too
function viaWrite(c) {
  let M;
  if (c) ({ Map: M } = globalThis);
  return M.groupBy([1, 2], x => x % 2);
}
function viaDecl(c) {
  if (c) { var { Promise: P } = globalThis; }
  return typeof P.try;
}
// an INSTANCE-method key stays raw like every other member of a refused alias
function viaInstanceKey(c) {
  let S;
  if (c) ({ Set: S } = globalThis);
  return typeof S.union;
}
export const r = [viaWrite(true), viaDecl(true), viaInstanceKey(true)];
