// Excluding the bare realm entry keeps that root native. A permitted backed hop may still supply the deepest available ponyfill
// for the continuation.
let q;
export const storeThrough = (q = globalThis.self.window).Map.name;
export const deleteRun = delete globalThis.self.window;
export { q };
