import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// the only assignment is in the for-INIT slot, which runs once before the loop (not on the back-edge);
// nothing reassigns `x` in the body, so the array narrow holds every iteration and `x.at()` keeps the
// array polyfill. boundary control for the for-init exclusion in the back-edge check.
declare function cond(): boolean;
let x;
for (x = [1, 2, 3]; cond();) {
  _atMaybeArray(x).call(x, -1);
}