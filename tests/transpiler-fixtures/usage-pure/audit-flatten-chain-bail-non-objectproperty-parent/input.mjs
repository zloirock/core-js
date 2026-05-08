// Single-element ArrayPattern `[{ Array: { from } }] = [globalThis]` is transparent when init mirrors it.
// Flatten must descend through the array wrapper and emit a clean polyfill alias for `from`.
const [{ Array: { from } }] = [globalThis];
const [{ Array: { of } }] = [globalThis];
export { from, of };
