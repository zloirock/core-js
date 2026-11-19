// a seal, a store and a sequence hand their value on unchanged, and the optional census stops at
// each of them - so a live `?.` below one is a source of undefined it never counted and the guard
// over the carrier erased, running the static where the source short-circuits. the differential is
// blind here: every spelling injects the same imports and only the text and the runtime differ.
let w, v;
const probe = globalThis.self.window;
export const behindSeal = (probe?.Array)?.of(1);
export const behindStore = (w = probe?.Array)?.of(2);
export const behindSequence = (eff(), probe?.Array)?.of(3);
export const behindNestedStore = (v = w = probe?.Array)?.of(4);
// NEGATIVE: the unsealed chain spells its own optionals and counts them as one source
export const bareChain = probe?.Array?.of(5);
// NEGATIVE: a PLAIN read below the carrier hands on a value nothing can absent
export const plainBelowStore = (w = probe.Array)?.of(6);
