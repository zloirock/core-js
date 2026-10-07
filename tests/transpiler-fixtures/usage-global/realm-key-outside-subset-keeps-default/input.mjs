// A realm key naming a built-in the configured subset does not carry (`AsyncIterator` and `URL` in `es`)
// is an unknown slot: an engine lacking it takes the inner default, whose static keeps its module
// (`Array.from`, `JSON.parse`). A built-in the subset carries takes its default as dead (`Iterator`); a known
// global core-js implements nothing of (`WeakRef`) may be missing on a target too (`Array.of`).
const { AsyncIterator: { from } = Array } = globalThis;
const { URL: { parse } = JSON } = globalThis;
const { Iterator: { concat } = Array } = globalThis;
const { WeakRef: { of } = Array } = globalThis;
export { from, parse, concat, of };
