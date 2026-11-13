// A used capture keeps its nullish rejection and original result.
// Global preserves the source; this row guards the injection surface.
const held = globalThis.window?.Array;
let of;
export const result = ({ of } = held);
