// flatten + sibling with nested block-body IIFE deeper than one level. asserts the bug
// fires regardless of nesting depth, not just outermost block body
const { Array: { from } } = globalThis, kls = (() => {
  if (true) {
    return [].values();
  }
  return null;
})();
export { from, kls };
