// Both synth bindings retain the throwing alias read.
const held = globalThis.window;
export const result = (({ resolve }) => resolve)(held.Promise);
