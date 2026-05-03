// negative control: NO var-shadow on `globalThis`, just a sibling IIFE that references
// it. Identifier visitor SHOULD substitute `globalThis` -> `_globalThis` inside the IIFE.
// confirms the var-walk fallback is gated correctly (only fires when shadow exists)
const { Array: { from } } = globalThis, val = (function () {
  return globalThis.Symbol;
})();
console.log(from, val);
