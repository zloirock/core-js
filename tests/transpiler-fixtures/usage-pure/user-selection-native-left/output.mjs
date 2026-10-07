import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A global every target carries natively is as present as one the build substitutes: the right of a
// `||` / `??` over it and the branch its presence test never takes are dead, and pure folds the selection
// where the dead part holds a known global or the deciding read is respelled, keeping it as written
// otherwise (`kept`). A global the targets need but a filter drops (`SuppressedError`,
// excluded here) may be missing: its presence test and a `||` reading it off the realm keep both operands
// live; its bare name, throwing first, decides.
export const native = Promise;
export const kept = Promise || legacyPromise;
export const ordered = Promise;
export const realm = globalThis.WeakSet;
export const tested = new WeakSet();
export const statics = Array.from(list);
export const dropped = SuppressedError;
export const probed = typeof SuppressedError === 'function' ? 1 : _Array$fromAsync(list);
export const realmDropped = globalThis.SuppressedError || _Map$groupBy;