// Instance-method `[].values()` lives inside a class body whose computed key is itself a
// polyfilled `globalThis.Symbol.iterator` access. Both rewrites cover overlapping source
// ranges with the sibling receiver substitution; if their edits are not composed, the
// bundler aborts on overlapping edits and the class fails to emit.
const { Array: { from } } = globalThis, kls = (() => {
  class C {
    [globalThis.Symbol.iterator]() { return [].values(); }
  }
  return C;
})();
export { from, kls };
