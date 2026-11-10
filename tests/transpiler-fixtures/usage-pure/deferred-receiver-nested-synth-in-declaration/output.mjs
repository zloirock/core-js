import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
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
  function f({
    from
  } = {
    from: _Array$from
  }) {
    return from([7])[0];
  }
  eff(f());
}));
r = at.call([3], 0);