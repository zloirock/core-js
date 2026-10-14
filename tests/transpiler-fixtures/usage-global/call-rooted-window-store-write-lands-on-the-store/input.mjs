// a store holding a `window` read off a call that yields the realm is the environment probe exactly
// as a named root's store is: a write through it acts on the stored value, so off-window it throws
// where the source throws instead of landing on the realm. a prefix the source wraps the store with
// runs ahead of it once, and a read or a `delete` keeps its own rule
let w;
const key = 'keyedSlot';
const owner = { realm() { return globalThis; } };
(w = (() => globalThis)().window).self.assignedSlot = 1;
(w = (() => globalThis)().window).self[key] = 1;
(w = (() => globalThis)().window).self.updatedSlot++;
(w = (() => globalThis)().window).self.defaultedSlot ||= 1;
[(w = (() => globalThis)().window).self.elementSlot] = [1];
({ v: (w = (() => globalThis)().window).self.propertySlot } = { v: 1 });
for ((w = (() => globalThis)().window).self.headSlot in { a: 1 });
(w = (() => globalThis)().window).self.self.deepSlot = 1;
(w = (() => globalThis)().window).self.window.windowSlot = 1;
(w = (function () { return globalThis; })().window).self.functionSlot = 1;
(w = owner.realm().window).self.memberSlot = 1;
(effect(), w = globalThis.window).self.prefixedSlot = 1;
export const readSlot = (w = (() => globalThis)().window).self.readSlot;
export const deletedSlot = delete (w = (() => globalThis)().window).self.deletedSlot;
