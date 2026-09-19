// `extends NS.Promise` with `const NS = { Promise }` - user-namespace wrapping the global
// via shorthand property. plugin follows NS.Promise to the namespace member, then the
// member value (Promise identifier) to the global, and routes `super.try(...)` through
// the Promise polyfill
const NS = { Promise };
class C extends NS.Promise {
  static run() { return super.try(() => 1); }
}
