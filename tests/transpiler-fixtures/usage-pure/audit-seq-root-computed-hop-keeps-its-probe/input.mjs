// Sequence prefixes precede the realm probe, and nested key claims run only on the live branch.
// The quiet dotted control retains its existing collapse; effectful realm keys stay in the source.
let c = 0;
const log = [];
export const seqRootComputedHop = (c++, globalThis)?.window?.[(log.push('k'), 'self')]?.Array.name;
export const seqRootDottedHop = (c++, globalThis).window?.self?.Array.name;
export const bareRootComputedHop = globalThis?.window?.[(log.push('k'), 'self')]?.Array.name;
export { c, log };
