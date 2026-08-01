// a claim with an SE computed key must keep ECMA receiver-before-key when the RECEIVER's
// own evaluation can throw (its member get reads off a nullish-able probe value): the key
// effect rides BEHIND a receiver memo, so the throw branch never runs it
let k = 0, m = 0, n = 0;
var probeHeld = (globalThis.window == null ? void 0 : globalThis.self);
export var viaGuardVarReceiver = probeHeld.Object[(k++, 'keys')];
export var viaGuardVarValues = probeHeld.Object[(m++, 'values')];
// a BARE identifier receiver evaluates without a get - native runs the key SE before its own
// get throws, so the plain SE prepend keeps native order (no memo)
export function viaBareReceiver(arr) { return arr[(n++, 'flat')](); }
// a static leaf off the guard-held var stays native (unresolved receiver type - claim bails)
export var viaStaticLeafBail = probeHeld.Array[(n++, 'from')]('ab');
export { k, m, n };
