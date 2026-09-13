// A stored realm selected by a ternary keeps both the write and its Promise static.
// The resolve call injects its static entry rather than only the constructor.
let held;
export const result = (true ? (held = globalThis) : globalThis).Promise.resolve(2);
export { held };
