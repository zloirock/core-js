import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
// destructure FROM a conditionally-assigned ctor alias keeps the throw of an untaken path: the
// claim at the pattern's edge detaches behind the identity guard, whose raw branch reads the static
// off the alias exactly as the pattern would, and the rest stays raw; a param DEFAULT keeps the alias
// verbatim (caller args always win natively)
function viaDecl(c) {
  let M;
  if (c) M = _Map;
  const groupBy = M === _Map ? _Map$groupBy : M.groupBy,
    {
      getOrInsert
    } = M;
  return [typeof groupBy, typeof getOrInsert];
}
function viaParamDefault(c) {
  let P;
  if (c) P = _Promise;
  function f({
    try: t
  } = P) {
    return typeof t;
  }
  return f();
}
export const r = [viaDecl(true), viaParamDefault(true)];