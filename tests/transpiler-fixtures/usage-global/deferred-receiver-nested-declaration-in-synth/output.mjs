import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
// Nested claims settle before an enclosing extraction or synth copies their receiver.
export let r;
export const effects = [];
function eff(x) {
  effects[effects.length] = x;
}
function source(cb) {
  cb();
  return Array;
}
const value = (({
  of,
  isArray
}) => [typeof of, typeof isArray])(source(() => {
  const {
    fromEntries
  } = Object;
  eff(fromEntries([["x", 7]]).x);
}));
r = value;