import _Array$from from "@core-js/pure/actual/array/from";
// param-destructure body-extract must skip the directive prologue when picking the insert
// anchor. inserting `let from = _Array$from;` at `body.start + 1` would push the directive
// past position 0 and demote it from prologue. fix uses `skipDirectivePrologue` to land
// the insert AFTER the trailing directive. rest sibling forces `findSynthSwapReceiver` to
// bail (rest excludes synth-swap) so the body-extract path actually fires. custom directive
// avoids the spec restriction on `"use strict"` in functions with non-simple parameters
function run({
  from: _unused,
  ...rest
} = Array) {
  "my custom directive";

  let from = _Array$from;
  return [from([1]), rest];
}
export { run };