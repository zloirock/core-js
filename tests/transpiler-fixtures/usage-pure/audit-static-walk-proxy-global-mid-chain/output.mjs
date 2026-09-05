import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// Nested destructure `const { root: { Array: { from } } } = ns` where `ns = { root: globalThis }`.
// The descent passes through the global mid-chain (root binds to globalThis) and lands on
// Array.from, so `from` resolves to the polyfilled Array.from rather than staying raw.
const ns = {
  root: _globalThis
};
const from = _Array$from;
export const arr = from([1, 2, 3]);