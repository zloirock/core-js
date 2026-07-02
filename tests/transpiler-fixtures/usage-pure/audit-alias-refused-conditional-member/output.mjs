import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// a REFUSED ctor-alias registration (conditional write / conditional hoisted `var` decl) keeps
// the value swap and leaves member reads RAW: the untaken path throws on the undefined binding
// exactly like untranspiled code; an instance-method key stays in the raw residual too
function viaWrite(c) {
  let M;
  if (c) M = _Map;
  return M.groupBy([1, 2], x => x % 2);
}
function viaDecl(c) {
  if (c) {
    var P = _Promise;
  }
  return typeof P.try;
}
// an INSTANCE-method key stays raw like every other member of a refused alias
function viaInstanceKey(c) {
  let S;
  if (c) S = _Set;
  return typeof S.union;
}
export const r = [viaWrite(true), viaDecl(true), viaInstanceKey(true)];