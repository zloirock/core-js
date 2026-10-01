// A computed realm hop under a sequence-prefixed root tests the environment probe once.
// The root prefix runs before that probe; the key effect runs only on the defined branch.
// The helper reads its leaf receiver once and needs no memo.
let c = 0;
const log = [];
export const seqRootComputedHop = (c++, globalThis)?.window?.[(log.push('k'), 'self')]?.Array.name;
// the DOTTED twin, whose test the same descent already kept
export const seqRootDottedHop = (c++, globalThis).window?.self?.Array.name;
// the BARE root, which the shared composition owns: one test, and the key effect rides the leaf
export const bareRootComputedHop = globalThis?.window?.[(log.push('k'), 'self')]?.Array.name;
export { c, log };
