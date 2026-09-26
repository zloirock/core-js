// the tail a guarded claim lifts into its alternate reads the substituted binding itself, and that
// binding is always defined - so the `?.` the source wrote directly on it guards nothing and lands
// plain. a kept WRITE standing in the test changes nothing about that. past the first step the
// value can be absent again, and a `?.` there still stands
let key, kept;
export const computedTailOverClaim = globalThis.window?.Map?.[key];
export const keptWriteTest = (kept = globalThis.window)?.Map?.[key];
export const deeperOptionalStays = globalThis.window?.self.Array?.prototype?.at;
export { kept };
