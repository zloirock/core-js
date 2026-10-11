// usage-global rewrites none of these sequences: a served global ahead of a sequence's value loads its
// modules whatever slot the value fills
const box = { slot: 1, read() { return this; } };
export const unbound = (globalThis.Set, box.read)();
export const indirect = (globalThis.Promise, eval)('this');
export const deleted = [delete (globalThis.Map, box.slot), box.slot];
export const kind = () => typeof (Array.from, undeclaredName);
export const called = (globalThis.WeakMap, box.read());
