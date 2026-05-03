import _Array$from from "@core-js/pure/actual/array/from";
const from = _Array$from;
// var-shadow nested 3 levels deep (block + if + try). collectScopeVars walks recursively
// past every non-function-boundary node type. flatten sibling IIFE preserves the inner
// `globalThis` ref against substitution. parser-tracker asymmetry covered uniformly
const val = function () {
  if (true) {
    {
      try {
        var globalThis = 'shadow';
      } catch {}
    }
  }
  return globalThis;
}();
console.log(from, val);