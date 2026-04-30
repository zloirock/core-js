// flatten + sibling block-body IIFE with many instance methods needing var _ref. asserts
// the bug surface widens with each additional _ref-requiring transform inside the sibling
const { Array: { from } } = globalThis, kls = (function () {
  const a = [].values();
  const b = [].keys();
  const c = [].entries();
  return [a, b, c];
})();
export { from, kls };
