import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// Nested claims settle before an enclosing extraction or synth copies their receiver.
export let r;
export const effects = [];
function eff(x) {
  effects[effects.length] = x;
}
function source(cb) {
  cb();
  return [3];
}
const at = _atMaybeArray(source(() => {
  const fromEntries = _Object$fromEntries;
  const includes = _includesMaybeArray([7]);
  eff(fromEntries([["x", includes.call([7], 7)]]).x);
}));
r = at.call([3], 0);