import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2;
// a claim with an SE computed key must keep ECMA receiver-before-key when the RECEIVER's
// own evaluation can throw (its member get reads off a nullish-able probe value): the key
// effect rides BEHIND a receiver memo, so the throw branch never runs it
let k = 0,
  m = 0,
  n = 0;
var probeHeld = _globalThis.window == null ? void 0 : _self;
export var viaGuardVarReceiver = (_ref = probeHeld.Object, k++, _keys(_ref));
export var viaGuardVarValues = (_ref2 = probeHeld.Object, m++, _values(_ref2));
// a BARE identifier receiver evaluates without a get - native runs the key SE before its own
// get throws, so the plain SE prepend keeps native order (no memo)
export function viaBareReceiver(arr) {
  return n++, _flatMaybeArray(arr).call(arr);
}
// a static leaf off the guard-held var stays native (unresolved receiver type - claim bails)
export var viaStaticLeafBail = probeHeld.Array[n++, 'from']('ab');
export { k, m, n };