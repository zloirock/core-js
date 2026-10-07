import "core-js/modules/es.error.is-error";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/esnext.promise.all-keyed";
import "core-js/modules/esnext.promise.all-settled-keyed";
// In usage-global a global every target carries natively is as present as one the build injects: the
// right of a `||` / `??` over it and the branch its presence test never takes inject nothing. A global the
// targets need but a filter drops (`SuppressedError`, excluded here) may be missing: its presence test and a
// `||` reading it off the realm keep both operands live and injected; its bare name, throwing first, decides.
export const native = Promise || Iterator;
export const ordered = Promise || use(DisposableStack, local);
export const realm = globalThis.WeakSet ?? AsyncDisposableStack;
export const tested = typeof WeakSet === 'undefined' ? Math.sumPrecise(list) : new WeakSet();
export const statics = Array.from ? Array.from(list) : Uint8Array.fromBase64(text);
export const dropped = SuppressedError || Object.groupBy;
export const probed = typeof SuppressedError === 'function' ? 1 : Array.fromAsync(list);
export const realmDropped = globalThis.SuppressedError || Map.groupBy;