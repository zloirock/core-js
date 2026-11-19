// A static declaration preserves instance polyfills in nested sibling function bodies.
const { Array: { from } } = globalThis, kls = (() => {
  if (true) {
    return [].values();
  }
  return null;
})();
export { from, kls };
