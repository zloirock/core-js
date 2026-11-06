// pure twin: a `var` hoisted to an ENCLOSING function shadows the global, used from a NESTED
// function. the climbing var-hoist fallback finds the local binding, so the static call stays
// native (no receiver-less substitution that would mask the local's runtime value)
function outer(cond) {
  if (cond) {
    var Map = 1;
  }
  function inner() {
    return Map.groupBy([], () => 0);
  }
  return inner;
}
outer(false);