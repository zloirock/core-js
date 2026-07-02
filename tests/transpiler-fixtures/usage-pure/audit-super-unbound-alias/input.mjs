// `const P = Promise` aliases the global constructor, then `class C extends P`.
// plugin resolves the alias chain to the global `Promise` and rewrites `super.try`
// inside the static method to the `Promise.try` pure import
const P = Promise;
class C extends P {
  static run() { return super.try(() => 1); }
}
