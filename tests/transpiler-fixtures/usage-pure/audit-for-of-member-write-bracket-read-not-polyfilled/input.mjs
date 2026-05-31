// `for (arr.at of items)` rebinds the `at` slot each iteration, so `arr.at` is a write target,
// NOT the Array.prototype.at method. a body read of the SAME slot in bracket form (`arr['at']`)
// must be recognized as that target (cross-form match: dot write vs bracket read) and left
// un-polyfilled. a genuine call on a DIFFERENT receiver (`other.at(0)`) still gets the polyfill,
// proving the discrimination is slot-specific, not method-wide.
let items = [],
  arr = {},
  other = [1, 2];
for (arr.at of items) {
  use(arr['at']);
}
other.at(0);
