// Nested destructure `const { root: { Array: { from } } } = ns` where `ns = { root: globalThis }`.
// The descent passes through the global mid-chain (root binds to globalThis) and lands on
// Array.from, so `from` resolves to the polyfilled Array.from rather than staying raw.
const ns = { root: globalThis };
const { root: { Array: { from } } } = ns;
export const arr = from([1, 2, 3]);
