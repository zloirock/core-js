import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Set from "@core-js/pure/actual/set/constructor";
// a REFUSED ctor-alias registration (conditional write / conditional hoisted `var` decl) keeps
// the value swap, and a member read of a known separate static gets the RUNTIME ctor guard:
// the taken path reads the pure static, the untaken path falls to the raw read and throws on
// the undefined binding exactly like untranspiled code; an instance-method key stays raw
function viaWrite(c) {
  let M;
  if (c) M = _Map;
  return (M === _Map ? _Map$groupBy : M.groupBy.bind(M))([1, 2], x => x % 2);
}
function viaDecl(c) {
  if (c) {
    var P = _Promise;
  }
  return typeof (P === _Promise ? _Promise$try : P.try);
}
// an INSTANCE-method key stays raw like every other member of a refused alias
function viaInstanceKey(c) {
  let S;
  if (c) S = _Set;
  return typeof S.union;
}
export const r = [viaWrite(true), viaDecl(true), viaInstanceKey(true)];