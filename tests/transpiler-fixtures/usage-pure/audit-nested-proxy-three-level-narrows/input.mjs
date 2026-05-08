// `globalThis.window.self.Array` is the same constructor at runtime; descent through known proxies must succeed.
// Walker must keep recursing whenever each intermediate key is itself a known global proxy.
const { window: { self: { Array } } } = globalThis;
const arr = Array.from([1, 2, 3]);
export { arr };
