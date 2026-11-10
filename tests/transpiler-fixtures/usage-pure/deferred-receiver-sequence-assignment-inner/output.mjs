import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// Nested claims settle before an enclosing extraction or synth copies their receiver.
export let r;
export const effects = [];
function eff(x) {
  effects[effects.length] = x;
}
let at;
function source(cb) {
  cb();
  return [3];
}
const result = (at = _atMaybeArray(source(() => {
  const fromEntries = _Object$fromEntries;
  eff(fromEntries([["x", 7]]).x);
})), at.call([3], 0));
r = result;