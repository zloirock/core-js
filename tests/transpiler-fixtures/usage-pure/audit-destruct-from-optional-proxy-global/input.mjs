// destructure init is optional-chain proxy-global (`globalThis?.Array`) - plugin
// resolves the receiver through the optional chain and replaces `from` with the
// Array.from polyfill import
const { from } = globalThis?.Array;
from([1, 2, 3]);
