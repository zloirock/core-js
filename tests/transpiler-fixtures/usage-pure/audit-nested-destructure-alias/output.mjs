import _Array$from from "@core-js/pure/actual/array/from";
// single-chain nested destructure `{ Array: { from } } = globalThis`. a default-on-native
// pattern would never fire because `globalThis.Array` is always present, so the whole
// declaration must be rewritten to always route `from` to the Array.from polyfill
const from = _Array$from;
from([1, 2, 3]);