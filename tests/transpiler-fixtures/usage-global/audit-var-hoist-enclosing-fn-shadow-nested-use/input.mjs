// a `var` hoisted to an ENCLOSING function shadows the global, and the use sits in a NESTED
// function below it. the var-hoist fallback must climb past the inner function to find the
// enclosing-scope binding, so `new Map()` resolves to the local (no polyfill injected) - not the
// global
function outer(cond) {
  if (cond) {
    var Map = 1;
  }
  function inner() {
    return new Map();
  }
  return inner;
}
outer(false);
