// var inside a nested INNER function does NOT shadow at the outer scope. collectScopeVars
// stops descent at function-like boundaries, so inner-fn vars don't pollute outer var-set.
// outer IIFE's `return globalThis` reference must still get `_globalThis` substitution
const { Array: { from } } = globalThis, val = (function () {
  function inner() { var globalThis = 'inner-only'; return globalThis; }
  inner();
  return globalThis.Symbol;
})();
console.log(from, val);
