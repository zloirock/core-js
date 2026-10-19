// `enum Map { ... }` (no `declare`) emits a runtime IIFE - `Map` becomes a real value
// binding shadowing the global. plugin recognises the user binding and leaves `Map.A`
// resolved against the runtime enum rather than rewriting it to the polyfill `_Map.A`
enum Map {
  A,
  B,
}
// @ts-expect-error a construction of the user's shadowing binding, which tsc refuses, is the shape under test
const m = new Map.A();
export { m };