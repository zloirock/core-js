// A retained store in a declaration still owes the source coercion.
// Global preserves the source; this row guards the injection surface.
let held;
export const { resolve: { length } } = (held = globalThis.window)?.Promise;
