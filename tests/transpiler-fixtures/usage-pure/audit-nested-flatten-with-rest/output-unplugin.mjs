import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// Nested-proxy flatten chain with rest sibling at the inner level:
// `const { Array: { from, ...rest } } = globalThis`.
// `applyRestAwareCascade` should replace `from` with `_unused` sentinel rather than
// remove it (rest exclusion preserved); polyfill emitted as separate `const from = _Array$from`
const from = _Array$from;
const { from: _unused, ...rest } = _globalThis.Array;
from([1, 2]);
export { rest };