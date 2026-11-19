// Dotted, literal, template and bound quiet realm keys retain their existing fold.
// Effectful and unknown keys keep their native reads; stored quiet runs keep their landing.
const litKey = 'window';
const chainedKey = litKey;
let reassigned = 'window';
reassigned = 'frames';
let e = 0;
let m;
let m2;
let s;
export const dotted = globalThis.self.window.probe;
export const stringKey = globalThis.self['window'].probe;
export const templateKey = globalThis.self[`window`].probe;
export const boundKey = globalThis.self[litKey].probe;
export const boundChain = globalThis.self[chainedKey].probe;
export const seqKey = globalThis.self[(e++, 'window')].probe;
export const seqKeyStoreRoot = (s = globalThis).self[(e++, 'window')].probe;
export const reassignedKey = globalThis.self[reassigned].probe;
export const dynamicKey = dyn => globalThis.self[dyn].probe;
export const nonRealmKey = globalThis.self[chainedKey.length].probe;
export const storedProbeDotted = (m = globalThis.window.self)?.Array.of(1);
export const storedProbeBoundKey = (m2 = globalThis[litKey].self)?.Array.from([2]);
export { e, m, m2, s };
