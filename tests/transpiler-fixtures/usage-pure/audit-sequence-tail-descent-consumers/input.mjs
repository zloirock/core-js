// One comma-sequence descent serves every consumer that reaches a value through a sequence tail, so
// this locks that descent where it is observable: an extends target, a member chain root, a computed
// key, a per-branch fallback, a parameter default and an IIFE callee - each on its own line with its
// own method, so no site masks another. Every prefix call must survive in the output: the descent
// classifies through the tail, it never discards what runs before it.
export class Sub extends (a(), globalThis).Array {}
export const chained = (b(), globalThis).Array.of(1, 2);
const { [(c(), 'from')]: made } = Array;
export const viaKey = made([3]);
export function branch(cond) {
  const { flat } = cond ? (d(), Array.prototype) : Iterator.prototype;
  return flat;
}
export function defaulted({ at } = (e(), Array.prototype)) {
  return at;
}
export const viaIife = ((0, () => Promise))().allSettled([]);
