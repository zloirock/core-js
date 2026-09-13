// Reading a different field of a returned object does not expose its constructor slot.
// The contained constructor stays narrow; no static is used.
const source = { read() { return { Constructor: Map, value: 1 }; } };
export const value = source.read().value;
