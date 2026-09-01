import _globalThis from "@core-js/pure/actual/global-this";
// a `delete` READS nothing over its navigation, so a TERMINAL run of realm hops folds WHOLE onto
// the root binding there - the read position keeps that same run spelled, and a seal over it
// changes neither answer. neither does a CARRIER at the root: a sequence prefix, the user's own
// store, both re-emit ahead of that binding with the rest of the dropped span, deciding what RUNS
// and never what the delete lands on.
// the rows live in a file of their own: a `delete` is a slot MUTATION, and sharing one with
// read rows would deopt every read of that slot in the file
let e = 0;
let w;
export const foldsTheRun = delete _globalThis.window;
export const sealedFoldsTheRun = delete _globalThis.window;
export const prefixedKeepsTheRoot = delete (e++, _globalThis).window;
export const deadPrefixIsTheBareTwin = delete _globalThis.window;
export const storeKeepsTheRoot = delete (w = _globalThis, _globalThis).window;
export const prefixedStoreKeepsTheRoot = delete (e++, w = _globalThis, _globalThis).window;

// ... and whatever the DROPPED span ran on the way in re-emits ahead of the base, where the
// source ran it: an effect buried in a hop's computed KEY is not carried by the deleted
// member's own key, and the fold is the only slot left for it
export const droppedHopKeyReEmits = delete (e++, _globalThis)[e++, 'window'];
export { e, w };