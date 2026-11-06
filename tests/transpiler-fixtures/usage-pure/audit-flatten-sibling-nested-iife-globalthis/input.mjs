// Sibling expression nests `globalThis` deep inside an IIFE chain with no shadowing.
// Receiver-ref rewrite must recurse through all wrapper layers so the inner reference resolves correctly.
const { Array: { from } } = globalThis, info = (() => {
  return (function outer() {
    return (() => {
      return globalThis;
    })();
  })();
})();
export { from, info };
