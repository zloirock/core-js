import _Array$from from "@core-js/pure/actual/array/from";
// destructure init is optional-chain proxy-global (`globalThis?.Array`) - plugin
// resolves the receiver through the optional chain and replaces `from` with the
// Array.from polyfill import
const from = _Array$from;
from([1, 2, 3]);