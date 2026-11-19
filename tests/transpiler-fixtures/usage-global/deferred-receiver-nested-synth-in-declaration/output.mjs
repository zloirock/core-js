import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
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
const {
  at
} = source(() => {
  function f({
    from
  } = Array) {
    return from([7])[0];
  }
  eff(f());
});
r = at.call([3], 0);