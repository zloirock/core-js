// a nested function PARAM shadows the alias name (`g(M)`), so `M = other` writes the param, not
// the outer `var M = globalThis` - the outer alias stays unreassigned, so `M.Array.from` resolves.
// guards the reassignment scan's shadow-skip: a shadowed write must NOT count as a violation of
// the outer var. the outer `var` is unconditional, so its assignment dominates the use
function f() {
  var M = globalThis;
  function g(M) { M = other; }
  M.Array.from([1]);
}
