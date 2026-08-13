import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
// a claim with an SE computed key must keep ECMA receiver-before-key when the RECEIVER's
// own evaluation can throw (its member get reads off a nullish-able OPAQUE probe): the key
// effect rides BEHIND a receiver memo, so the throw branch never runs it. opaque only - a
// guard ternary holding a proxy global classifies through its defined branch and claims
let k = 0,
  m = 0;
export function viaOpaqueProbeKeys(host) {
  var _ref;
  var probeHeld = host == null ? void 0 : host;
  return _ref = probeHeld.Object, k++, _keys(_ref);
}
export function viaOpaqueProbeValues(host) {
  var _ref2;
  var probeHeld = host == null ? void 0 : host;
  return _ref2 = probeHeld.Object, m++, _values(_ref2);
}
export { k, m };