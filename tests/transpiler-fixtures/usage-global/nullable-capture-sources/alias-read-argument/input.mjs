// Both synth bindings retain the throwing alias read.
// Global preserves the source; this row guards the injection surface.
const held = globalThis.window;
export const result = (({ resolve }) => resolve)(held.Promise);
