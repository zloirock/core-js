// flatten sibling has globalThis reference inside a deeply nested IIFE chain. each IIFE
// pushes a function scope. polyfillSiblingReceiverRefs walks recursively, so the
// inner `globalThis` reference must reach the polyfilled binding through all wrapper
// layers (no shadowing exists)
const { Array: { from } } = globalThis, info = (() => {
  return (function outer() {
    return (() => {
      return globalThis;
    })();
  })();
})();
export { from, info };
