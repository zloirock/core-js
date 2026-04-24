// shorthand destructure `const { Set } = globalThis` - Set keeps its global name via the
// shorthand key (equivalent to `Set: Set`). extending that alias and calling `super.union`
// routes to the Set polyfill - Set.prototype.union is an ES2025 method that needs polyfilling
const { Set } = globalThis;
class C extends Set {
  static combine(a, b) { return super.union(a, b); }
}
