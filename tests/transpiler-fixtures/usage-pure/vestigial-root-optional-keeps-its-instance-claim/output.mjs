import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A VESTIGIAL `?.` over an unbacked realm run, read by a non-call INSTANCE claim: the hop erases and
// the claim still dispatches. Routed off the un-erased spelling the read stood down, and nothing
// re-drives it - the root-claim fold of an unbacked run replaces below the read, never over it.
// The helper reads its receiver once, so neither effect-bearing root needs a receiver memo.
// NEGATIVES: the same run with no effect in the root, and a BACKED hop, which the hop claim collapses.
// `usage-global` rewrites no source here, so it has no twin to hold: its import set is the same
// either way and a row there would be green whichever way the read routes.
let seq = 0;
export const effectRoot = _nameMaybeFunction((seq++, _globalThis).Array);
export const bareRoot = _nameMaybeFunction(_globalThis.Object);
export const backedHop = _nameMaybeFunction((seq++, _self).Number);
export { seq };