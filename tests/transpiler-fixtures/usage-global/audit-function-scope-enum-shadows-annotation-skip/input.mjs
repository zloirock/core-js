// enum inside a function body shadows the global only within that body. annotation walker
// must consult the path-anchored adapter hasBinding so the inner `let x: Map` resolves to
// the function-scope enum, not the outer Map polyfill. without path anchoring, the scan
// would only check program-level bindings and miss inner-scope TS-runtime shadows
function f() {
  enum Map {
    A,
  }
  let x: Map;
  return x;
}
export { f };
