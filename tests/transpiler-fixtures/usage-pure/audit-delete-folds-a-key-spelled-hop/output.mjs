import _globalThis from "@core-js/pure/actual/global-this";
// Quiet realm keys retain delete folding across root carriers.
// Effectful or unknown realm keys retain native navigation and their effects.
const hopKey = 'window';
let e = 0;
let s;
let s2;
export const identRoot = delete _globalThis.probe;
export const callRoot = delete (eff(), _globalThis).probe;
export const storeRoot = delete (s = _globalThis, _globalThis).probe;
export const deadSeqRoot = delete _globalThis.probe;
export const seqKeyCallRoot = delete (eff(), _globalThis)[e++, 'window'].probe;
export const seqKeyStoreRoot = delete (s2 = _globalThis, _globalThis)[e++, 'window'].probe;
export const dynamicKey = dyn => delete (eff(), _globalThis)[dyn].probe;
export { e, s, s2 };