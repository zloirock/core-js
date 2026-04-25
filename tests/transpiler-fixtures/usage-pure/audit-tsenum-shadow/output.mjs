// `enum Map { ... }` (no `declare`) emits a runtime IIFE - `Map` becomes a real value
// binding shadowing the global. plugin must NOT polyfill `Map.A` against the polyfilled
// constructor (would emit `_Map.A` reading from the polyfill that has no `.A` member)
enum Map {
  A,
  B,
}
const m = new Map.A();
export { m };