// A plain read through an absent realm alias must still throw.
// Global preserves the source; this row guards the injection surface.
const held = globalThis.window;
export const { resolve, unknown: { value } = {} } = held.Promise;
