// A sequence rooting a probe navigation hides nothing from usage detection: the global the navigation reaches
// through the sequence's tail pulls its modules for a `delete`, a sealed read, a read through an alias of the
// probe's value and a `typeof` over a bare probe name alike.
let e = 0;
const A = globalThis.window;
export const removed = delete (e++, globalThis.window)?.self.Map.k;
export const sealed = ((e++, self.window)?.self).Set.list;
export const viaAlias = (e++, A)?.self.WeakMap.mode;
export const viaBare = typeof (e++, window)?.self.Iterator.api;
export const dropped = delete (e++, A)?.self.WeakSet.box;
