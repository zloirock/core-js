// minimal repro: computed-key in class method using globalThis as proxy chain. without
// `[].values()` or other instance dispatch, just to isolate whether the issue is the
// computed-key polyfill substitution colliding with sibling-receiver Identifier rewrite
const { Array: { from } } = globalThis, kls = (() => {
  class C {
    [globalThis.Symbol.iterator]() { return null; }
  }
  return C;
})();
export { from, kls };
