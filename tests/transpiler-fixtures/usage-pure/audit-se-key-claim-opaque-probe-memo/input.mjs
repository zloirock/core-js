// a claim with an SE computed key must keep ECMA receiver-before-key when the RECEIVER's
// own evaluation can throw (its member get reads off a nullish-able OPAQUE probe): the key
// effect rides BEHIND a receiver memo, so the throw branch never runs it. opaque only - a
// guard ternary holding a proxy global classifies through its defined branch and claims
let k = 0, m = 0;
export function viaOpaqueProbeKeys(host) {
  var probeHeld = host == null ? void 0 : host;
  return probeHeld.Object[(k++, 'keys')];
}
export function viaOpaqueProbeValues(host) {
  var probeHeld = host == null ? void 0 : host;
  return probeHeld.Object[(m++, 'values')];
}
export { k, m };
