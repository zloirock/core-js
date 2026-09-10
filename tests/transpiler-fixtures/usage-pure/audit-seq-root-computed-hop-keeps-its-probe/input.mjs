// a computed realm hop under a SEQUENCE-prefixed root: the `?.` below it tests the environment
// probe exactly as the dotted spelling does, and a prefix around the root is no reason to read that
// hop as always-defined. the descent to the root walked MEMBERS alone, so a sequence there read as
// "no proxy-global root at all", the probe test was dropped and the key's effect ran on the branch
// native short-circuits past - a divergence in the value AND in how many times the effect runs.
// the memo composes with that probe rather than testing its result again: the shared plan owns a
// SEQUENCE root too, since what it re-emits is the probe alone and the prefix rides inside it where
// the source runs it. ONE test stands on every row of both legs.
// the sidecar records what is left, and it is a SPELLING split on the first row alone: babel lands
// the whole nav in place there off a gate of its own, which erases the root's dead `?.` and memoizes
// the leaf, while the composition keeps the source's spelling and reads the leaf inline. same value,
// same effect counts in every realm. the landing may not simply stand down for the composition -
// where the composition declines a nav, that landing is what keeps the ponyfill in the memo
let c = 0;
const log = [];
export const seqRootComputedHop = (c++, globalThis)?.window?.[(log.push('k'), 'self')]?.Array.name;
// the DOTTED twin, whose test the same descent already kept
export const seqRootDottedHop = (c++, globalThis).window?.self?.Array.name;
// the BARE root, which the shared composition owns: one test, and the key effect rides the leaf
export const bareRootComputedHop = globalThis?.window?.[(log.push('k'), 'self')]?.Array.name;
export { c, log };
