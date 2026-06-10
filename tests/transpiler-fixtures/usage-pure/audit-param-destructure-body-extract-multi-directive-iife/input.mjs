// `directive-prologue skip` must advance past ALL leading directives, not just the first.
// 2+ directives in a row exercise the loop iteration. body-extract insert anchor must land
// AFTER the second directive so neither gets demoted out of the prologue (`"my dir b"`
// would lose its prologue status if the insert landed between the two)
// (immediately invoked: caller-lossy param emissions stay sound only when every call site is
// visible - a declared function's params now stay verbatim instead)
(function run({ from, ...rest } = Array) {
  "my dir a";
  "my dir b";
  return [from([1]), rest];
})();
