// Quiet terminal realm runs retain their existing delete fold and source prefixes.
// Effectful realm keys keep native navigation and delete-key evaluation.
let e = 0;
let w;
export const foldsTheRun = delete globalThis.self.window;
export const sealedFoldsTheRun = delete (globalThis.self.window);
export const prefixedKeepsTheRoot = delete (e++, globalThis).self.window;
export const deadPrefixIsTheBareTwin = delete (0, globalThis).self.window;
export const storeKeepsTheRoot = delete (w = globalThis).self.window;
export const prefixedStoreKeepsTheRoot = delete (e++, w = globalThis).self.window;

export const droppedHopKeyReEmits = delete globalThis[(e++, 'self')][(e++, 'window')];
export { e, w };
