// a direct `eval` runs its string in the caller's own scope chain, so it can call - or replace -
// any function that chain reaches while leaving no reference for the call-site census to count: a
// defaulted parameter narrowed on that empty set forwards a foreign argument to a type-specific
// helper. the negative pins the reach - a declaration one scope in is not on that chain
function reached(x = "abc") {
  return x.at(0);
}
eval("reached([1, 2])");
function outer() {
  function kept(y = [1, 2]) {
    return y.includes(1);
  }
  return kept();
}
export const a = [reached(), outer()];
