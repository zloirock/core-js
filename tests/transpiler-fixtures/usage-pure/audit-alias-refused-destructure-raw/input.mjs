// destructure FROM a refused ctor alias stays RAW: an untaken path throws on the destructure
// exactly like untranspiled code; a param DEFAULT keeps the alias verbatim (caller args always
// win natively)
function viaDecl(c) {
  let M;
  if (c) ({ Map: M } = globalThis);
  const { groupBy, getOrInsert } = M;
  return [typeof groupBy, typeof getOrInsert];
}
function viaParamDefault(c) {
  let P;
  if (c) ({ Promise: P } = globalThis);
  function f({ try: t } = P) {
    return typeof t;
  }
  return f();
}
export const r = [viaDecl(true), viaParamDefault(true)];
