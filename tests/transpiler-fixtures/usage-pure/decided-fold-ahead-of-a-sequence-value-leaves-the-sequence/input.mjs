// an element ahead of a sequence's value that a decided selection folds to what performs nothing leaves the
// sequence, parenthesized or not, a lone value taking its place; the value keeps its fold, and a callee keeps
// an element ahead of it - alone it would call its method on its object
(typeof Symbol == 'undefined' && (globalThis.Symbol = SymbolShim), run());
((typeof Set == 'undefined' && (globalThis.Set = SetShim)), finish());
export const started = (typeof Map == 'undefined' ? installMap() : 0, start());
export const last = (prepare(), typeof WeakMap == 'undefined' && (globalThis.WeakMap = WeakMapShim));
const handler = { fire() { return this; } };
export const unbound = (typeof WeakSet == 'undefined' && (globalThis.WeakSet = WeakSetShim), handler.fire)();
