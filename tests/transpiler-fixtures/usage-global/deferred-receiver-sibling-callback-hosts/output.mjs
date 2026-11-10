import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
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
  const {
    fromEntries
  } = Object;
  const {
    includes
  } = [7];
  eff(fromEntries([["x", includes.call([7], 7)]]).x);
});
r = at.call([3], 0);