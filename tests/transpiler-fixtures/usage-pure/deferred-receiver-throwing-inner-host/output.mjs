import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
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
try {
  const at = _atMaybeArray(source(() => {
    const fromEntries = _Object$fromEntries;
    eff(fromEntries(null));
  }));
  r = at;
} catch (error) {
  r = _nameMaybeFunction(error);
}