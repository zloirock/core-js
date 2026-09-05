// a MUTATED static keeps the user's own value on the raw read: the composition that would bind the
// ponyfill stands down, and the leaf reads through the proxy root's slot the way the source does
Array.of = patched;
const { Array: { of: { name: viaHop } = {} } } = globalThis;
const { of: { name: viaMemberInit } = {} } = globalThis.Array;
export { viaHop, viaMemberInit };
