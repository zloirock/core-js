import _Array$from from "@core-js/pure/actual/array/from";
// `const { self: { Array: { from } } } = globalThis` - 3-level nested proxy destructure.
// nested-proxy flatten must unwind the full property cascade (N-deep, not only direct
// parent), so `from` is recognised as `globalThis.Array.from` and gets polyfilled
const from = _Array$from;
from(xs);