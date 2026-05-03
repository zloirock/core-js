import _Array$from from "@core-js/pure/actual/array/from";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
const from = _Array$from;
// var inside a nested INNER function does NOT shadow at the outer scope. collectScopeVars
// stops descent at function-like boundaries, so inner-fn vars don't pollute outer var-set.
// outer IIFE's `return globalThis` reference must still get `_globalThis` substitution
const val = function () {
  function inner() {
    var globalThis = 'inner-only';
    return globalThis;
  }
  inner();
  return _Symbol;
}();
console.log(from, val);