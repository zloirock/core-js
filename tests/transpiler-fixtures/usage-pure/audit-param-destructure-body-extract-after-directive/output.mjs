// param-destructure body-extract must skip the directive prologue when picking the insert
// anchor. inserting `let from = _Array$from;` at `body.start + 1` would push the directive
// past position 0 and demote it from prologue. fix uses `directive-prologue skip` to land
// the insert AFTER the trailing directive. rest sibling forces `findSynthSwapReceiver` to
// bail (rest excludes synth-swap) so the body-extract path actually fires. custom directive
// avoids the spec restriction on `"use strict"` in functions with non-simple parameters
// NOTE: these functions are EXPORTED - external callers are invisible, so the call-site scan
// cannot prove the default always applies and the params stay VERBATIM; the body-extract
// behavior is covered by the immediately-invoked twin fixture
function run({
  from,
  ...rest
} = Array) {
  "my custom directive";

  return [from([1]), rest];
}
export { run };