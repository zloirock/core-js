import _Array$from from "@core-js/pure/actual/array/from";
// 4-level nested destructure over a proxy-global chain
// `{ self: { window: { Array: { from } } } } = globalThis`. every intermediate key
// is a known global alias, so the pattern flattens to `from = Array.from` polyfill
const from = _Array$from;
from(xs);