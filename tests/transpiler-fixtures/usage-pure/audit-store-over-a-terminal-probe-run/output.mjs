import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// what a STORE spells over a terminal realm probe: the value it hands on IS the realm object, so
// the probe folds onto the ponyfill - through a seal, a dead sequence element and a proven call
// root alike. the one thing that stops the fold is an EFFECT inside the run: it has no slot in the
// folded value, so the collapse keeps its own spelling and the probe rides the ponyfill, exactly
// as the `delete` fold and the flat read do. every row is one spelling of the same entity, and
// they must all answer the same way
let e = 0;
let stored;
function dh() {
  return _globalThis;
}
export const plain = stored = _self;
export const sealed = stored = _self;
export const deadSeq = stored = _self;
export const callRoot = stored = _self;

// ... and the effect-carrying twins of the same four
export const prefixed = stored = (e++, _self).window;
export const callPrefixed = stored = (e++, _self).window;
export const seKeyed = stored = _self[e++, 'window'];
export { e, stored };