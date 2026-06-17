// `enum Map { ... }` (no `declare`) emits a runtime IIFE - `Map` becomes a real value
// binding shadowing the global. plugin recognises the user binding and leaves `Map.A`
// resolved against the runtime enum rather than rewriting it to the polyfill `_Map.A`
enum Map {
  A,
  B,
}
const m = new Map.A();
export { m };