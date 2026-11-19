// usage-global rewrites none of these sequences: an element ahead of the value and the value itself load
// the modules of the global their tests read, folded away in pure or not
(typeof Symbol == 'undefined' && (globalThis.Symbol = SymbolShim), run());
((typeof Set == 'undefined' && (globalThis.Set = SetShim)), finish());
export const started = (typeof Map == 'undefined' ? installMap() : 0, start());
export const last = (prepare(), typeof WeakMap == 'undefined' && (globalThis.WeakMap = WeakMapShim));
const handler = { fire() { return this; } };
export const unbound = (typeof WeakSet == 'undefined' && (globalThis.WeakSet = WeakSetShim), handler.fire)();
