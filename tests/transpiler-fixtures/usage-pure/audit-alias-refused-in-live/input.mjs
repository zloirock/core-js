// Exported readers retain unknown callers beside the closed example calls below.
// `key in alias` reflection over a REFUSED ctor alias stays a LIVE check (the fold canon
// applies only to trusted resolutions); an unresolvable key stays live for any alias
export function viaConditional(c) {
  let M;
  if (c) ({ Map: M } = globalThis);
  return 'groupBy' in M;
}
export function viaUnresolvable(c) {
  let P;
  if (c) ({ Promise: P } = globalThis);
  return 'rand' in P;
}
export const r = [viaConditional(true), viaUnresolvable(true)];
