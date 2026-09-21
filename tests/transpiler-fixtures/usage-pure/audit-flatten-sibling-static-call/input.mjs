// A static call inside a sibling function keeps its own polyfill beside the nested static.
const { Array: { from } } = globalThis, kls = (() => {
  return Object.values({ a: 1 });
})();
export { from, kls };
