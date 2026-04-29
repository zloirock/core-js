// awaited dynamic import resolves to a promise of the module namespace - the destructured `from`
// binds to whatever the runtime module exports, not the static `Array.from`. Promise + iterator
// polyfills required by the await are still emitted
const { from } = await import("./array-like.js");
