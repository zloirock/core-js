// `const { from } = cond && Array` -  when `cond` is falsy, the runtime value is `cond`
// (not Array), and `from` would be `undefined` (since destructuring falsy-non-nullish binds
// to undefined). Pure-mode transform replaces the destructure with a direct polyfill import,
// eliminating the conditional evaluation entirely - `from` now always resolves to the
// polyfill instead of `undefined` when `cond` is falsy
const { from } = cond && Array;
use(from);
