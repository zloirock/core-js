// static call in sibling: `Object.values(...)` requires polyfill substitution as well.
// asserts whether instance-dispatch is uniquely problematic, or any transform inside
// sibling triggers the chunk-split error
const { Array: { from } } = globalThis, kls = (() => {
  return Object.values({ a: 1 });
})();
export { from, kls };
