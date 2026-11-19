// a pure import the build respells a sequence's prefix to performs nothing and leaves, save where the value
// alone would read differently in the sequence's slot: a callee would bind its object, `eval` would turn
// direct, a `delete` would delete and a `typeof` would stop throwing; a call's result takes the sequence's place
const box = { slot: 1, read() { return this; } };
export const unbound = (globalThis.Set, box.read)();
export const indirect = (globalThis.Promise, eval)('this');
export const deleted = [delete (globalThis.Map, box.slot), box.slot];
export const kind = () => typeof (Array.from, undeclaredName);
export const called = (globalThis.WeakMap, box.read());
