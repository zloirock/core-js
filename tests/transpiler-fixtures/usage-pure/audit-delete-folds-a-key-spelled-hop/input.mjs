// Quiet realm keys retain delete folding across root carriers.
// Effectful or unknown realm keys retain native navigation and their effects.
const hopKey = 'window';
let e = 0;
let s;
let s2;
export const identRoot = delete globalThis.self[hopKey].probe;
export const callRoot = delete (eff(), globalThis).self[hopKey].probe;
export const storeRoot = delete (s = globalThis).self[hopKey].probe;
export const deadSeqRoot = delete (0, globalThis).self[hopKey].probe;
export const seqKeyCallRoot = delete (eff(), globalThis).self[(e++, 'window')].probe;
export const seqKeyStoreRoot = delete (s2 = globalThis).self[(e++, 'window')].probe;
export const dynamicKey = dyn => delete (eff(), globalThis).self[dyn].probe;
export { e, s, s2 };
