import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
// `key in alias` reflection over a REFUSED ctor alias stays a LIVE check (the fold canon
// applies only to trusted resolutions); an unresolvable key stays live for any alias
function viaConditional(c) {
  let M;
  if (c) M = _Map;
  return 'groupBy' in M;
}
function viaUnresolvable(c) {
  let P;
  if (c) P = _Promise;
  return 'rand' in P;
}
export const r = [viaConditional(true), viaUnresolvable(true)];