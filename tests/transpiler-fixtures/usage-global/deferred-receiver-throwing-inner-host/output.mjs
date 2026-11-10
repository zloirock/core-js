import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.function.name";
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
  const {
    at
  } = source(() => {
    const {
      fromEntries
    } = Object;
    eff(fromEntries(null));
  });
  r = at;
} catch (error) {
  r = error.name;
}