// instance method `[].values()` inside sibling without computed-key. tests if simpler
// instance dispatch in sibling-receiver context still works
const { Array: { from } } = globalThis, kls = (() => {
  return [].values();
})();
export { from, kls };
