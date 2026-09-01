// a `delete` READS nothing over its navigation, so a TERMINAL run of realm hops folds WHOLE onto
// the root binding there - the read position keeps that same run spelled, and a seal over it
// changes neither answer. what does change it is an EFFECT inside the run: with a prefix to
// re-emit, the collapse keeps its own spelling and the probe rides the claim's pure.
// the rows live in a file of their own: a `delete` is a slot MUTATION, and sharing one with
// read rows would deopt every read of that slot in the file
let e = 0;
export const foldsTheRun = delete globalThis.self.window;
export const sealedFoldsTheRun = delete (globalThis.self.window);
export const prefixedKeepsTheBase = delete (e++, globalThis).self.window;

// ... and whatever the DROPPED span ran on the way in re-emits ahead of the base, where the
// source ran it: an effect buried in a hop's computed KEY is not carried by the deleted
// member's own key, and the fold is the only slot left for it
export const droppedHopKeyReEmits = delete globalThis[(e++, 'self')][(e++, 'window')];
export { e };
