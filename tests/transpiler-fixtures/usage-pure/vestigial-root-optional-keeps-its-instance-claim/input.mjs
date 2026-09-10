// A VESTIGIAL `?.` over an unbacked realm run, read by a non-call INSTANCE claim: the hop erases and
// the claim still dispatches. Routed off the un-erased spelling the read stood down, and nothing
// re-drives it - the root-claim fold of an unbacked run replaces below the read, never over it.
// NEGATIVES: the same run with no effect in the root, and a BACKED hop, which the hop claim collapses.
// `usage-global` rewrites no source here, so it has no twin to hold: its import set is the same
// either way and a row there would be green whichever way the read routes.
let seq = 0;
export const effectRoot = (seq++, globalThis)?.window.Array.name;
export const bareRoot = globalThis?.window.Object.name;
export const backedHop = (seq++, globalThis)?.self.Number.name;
export { seq };
