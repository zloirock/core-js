// add instance method `[].values()` inside class body alongside computed-key polyfill.
// when both polyfills overlap with sibling-receiver Identifier rewrite, transform-queue
// reports overlapping edits
const { Array: { from } } = globalThis, kls = (() => {
  class C {
    [globalThis.Symbol.iterator]() { return [].values(); }
  }
  return C;
})();
export { from, kls };
