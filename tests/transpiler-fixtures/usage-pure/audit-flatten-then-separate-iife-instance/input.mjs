// A following function keeps its instance polyfill independently of the preceding static declaration.
const { Array: { from } } = globalThis;
const kls = (() => {
  return [].values();
})();
export { from, kls };
