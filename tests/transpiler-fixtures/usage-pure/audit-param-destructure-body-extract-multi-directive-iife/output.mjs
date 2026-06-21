import _Array$from from "@core-js/pure/actual/array/from";
// body-extract must advance past ALL leading directives, not just the first; 2+ in a row
// exercise the loop. the insert anchor must land AFTER the second directive so neither gets
// demoted out of the prologue (`"my dir b"` would lose prologue status if it landed between).
// immediately-invoked: every call site visible, so caller-lossy param emissions stay sound
(function run({
  from: _unused,
  ...rest
} = Array) {
  "my dir a";
  "my dir b";

  let from = _Array$from;
  return [from([1]), rest];
})();