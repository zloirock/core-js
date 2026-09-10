// a realm hop's key names its slot through the CANON key resolver, never through the shape the key
// node happens to carry: a string literal, a template, an SE-bearing key's quiet tail and a key
// BOUND to a constant string all name the hop its dotted twin names, so the fold drops them alike.
// the observable is the TEXT both emitters print - the import sets are identical either way, so no
// differential row can see this, and `usage-global` rewrites no source to hold a twin
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
// ... and the boundary: a key the resolver cannot name is no name at all - the hop keeps its place
// over the deepest span pure can back, and so does one naming no realm surface
export const reassignedKey = globalThis.self[reassigned].probe;
export const dynamicKey = dyn => globalThis.self[dyn].probe;
export const nonRealmKey = globalThis.self[chainedKey.length].probe;
// ... and the same name decides the GUARD a stored probe nav earns: the hop is the environment probe
// whichever key spells it, so the store keeps its test instead of reading an always-defined ponyfill
export const storedProbeDotted = (m = globalThis.window.self)?.Array.of(1);
export const storedProbeBoundKey = (m2 = globalThis[litKey].self)?.Array.from([2]);
export { e, m, m2, s };
