import _globalThis from "@core-js/pure/actual/global-this";
// a `delete` reads nothing over its navigation, so the run folds WHOLE onto the root binding - and a
// hop whose key the canon resolver NAMES folds there with the dotted spelling, whatever spells it.
// each root shape reaches that fold through a channel of its own, so each is pinned separately.
// the observable is the TEXT both emitters print (identical import sets), so no differential row can
// see it; own file, because a `delete` is a slot mutation that deopts every read beside it
const hopKey = 'window';
let e = 0;
let s;
let s2;
export const identRoot = delete _globalThis.probe;
export const callRoot = delete (eff(), _globalThis).probe;
export const storeRoot = delete (s = _globalThis, _globalThis).probe;
export const deadSeqRoot = delete _globalThis.probe;
// ... and an EFFECT-bearing key names the hop through its quiet tail while its prefix re-emits ahead
// of the base, wherever the run is rooted: the effect has no other slot once the hop is gone
export const seqKeyCallRoot = delete (eff(), e++, _globalThis).probe;
export const seqKeyStoreRoot = delete (s2 = _globalThis, e++, _globalThis).probe;
// ... and a key nothing can name keeps its hop wherever the run stands
export const dynamicKey = dyn => delete (eff(), _globalThis)[dyn].probe;
export { e, s, s2 };