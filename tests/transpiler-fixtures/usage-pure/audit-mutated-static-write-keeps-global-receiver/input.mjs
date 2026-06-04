// usage-pure: writing a static onto a polyfillable global constructor and reading the same key must
// BOTH stay on the global. rewriting the write receiver to the pure import (`_Map.foo = x`) while
// the read bails to the global (mutated static) would write and read different objects (result
// undefined vs 123). no polyfill import is emitted - both sides keep the bare global.
Map.foo = 123;
export const result = Map.foo;
