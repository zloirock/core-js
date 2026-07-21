import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// a write that lives in a DEFERRED home runs at an unknown time, so a positional narrow
// cannot see it: the captured function is called BEFORE the use, yet its write sits after it
// in source order. an IIFE body is not such a home - it lifts to a straight-line position
let mutated = [1, 2, 3];
applyMutation();
export const degraded = _at(mutated).call(mutated, 0);
function applyMutation() {
  mutated = 'zz';
}
// a captured function that does NOT write keeps the narrow
let untouched = [1, 2, 3];
readOnly();
export const narrowed = _atMaybeArray(untouched).call(untouched, 0);
function readOnly() {
  return untouched.length;
}
// an IIFE invoked AFTER the use stays positionally bounded, so the narrow survives
let afterUse = [1, 2, 3];
export const iifeAfter = _atMaybeArray(afterUse).call(afterUse, 0);
(() => {
  afterUse = 'zz';
})();
// a straight-line write before the use still wins
let overwritten = [1, 2, 3];
overwritten = 'zz';
export const straightLine = _atMaybeString(overwritten).call(overwritten, 0);