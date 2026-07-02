import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
// destructure FROM a refused ctor alias stays RAW: an untaken path throws on the destructure
// exactly like untranspiled code; a param DEFAULT keeps the alias verbatim (caller args always
// win natively)
function viaDecl(c) {
  let M;
  if (c) M = _Map;
  const {
    groupBy,
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