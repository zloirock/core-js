// a `var` hoisted to an ENCLOSING function shadows the global, used from a doubly-nested arrow chain.
// the var-hoist fallback climbs past both arrows to the enclosing-scope binding, so `new Map()`
// resolves to the local and no polyfill is injected
function outer(cond) {
  if (cond) {
    var Map = 1;
  }
  return () => () => new Map();
}
outer(false);