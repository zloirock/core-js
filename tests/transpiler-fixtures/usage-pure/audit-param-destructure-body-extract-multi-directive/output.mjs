// `directive-prologue skip` must advance past ALL leading directives, not just the first.
// 2+ directives in a row exercise the loop iteration. body-extract insert anchor must land
// AFTER the second directive so neither gets demoted out of the prologue (`"my dir b"`
// would lose its prologue status if the insert landed between the two)
// NOTE: these functions are EXPORTED - external callers are invisible, so the call-site scan
// cannot prove the default always applies and the params stay VERBATIM; the body-extract
// behavior is covered by the immediately-invoked twin fixture
function run({
  from,
  ...rest
} = Array) {
  "my dir a";
  "my dir b";

  return [from([1]), rest];
}
export { run };