import _globalThis from "@core-js/pure/actual/global-this";
// Quiet terminal realm runs retain their existing delete fold and source prefixes.
// Effectful realm keys keep native navigation and delete-key evaluation.
let e = 0;
let w;
export const foldsTheRun = delete _globalThis.window;
export const sealedFoldsTheRun = delete _globalThis.window;
export const prefixedKeepsTheRoot = delete (e++, _globalThis).window;
export const deadPrefixIsTheBareTwin = delete _globalThis.window;
export const storeKeepsTheRoot = delete (w = _globalThis, _globalThis).window;
export const prefixedStoreKeepsTheRoot = delete (e++, w = _globalThis, _globalThis).window;
export const droppedHopKeyReEmits = delete _globalThis[e++, 'self'][e++, 'window'];
export { e, w };