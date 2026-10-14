// pure counts a global present as usage-global does, wherever the data subset carries it: one every target carries
// natively, and one the targets need but a filter drops (`SuppressedError`, excluded here), read by its bare name,
// off the realm or in a `typeof` test alike - the right of a `||` / `??` over it and the branch its presence test
// never takes are dead. pure folds the selection where the dead part holds a known global or the deciding read is
// respelled, keeping it as written otherwise (`kept`).
export const native = Promise || Iterator;
export const kept = Promise || legacyPromise;
export const ordered = Promise || use(DisposableStack, local);
export const realm = globalThis.WeakSet ?? AsyncDisposableStack;
export const tested = typeof WeakSet === 'undefined' ? Math.sumPrecise(list) : new WeakSet();
export const statics = Array.from ? Array.from(list) : Uint8Array.fromBase64(text);
export const dropped = SuppressedError || Object.groupBy;
export const probed = typeof SuppressedError === 'function' ? 1 : Array.fromAsync(list);
export const realmDropped = globalThis.SuppressedError || Map.groupBy;
