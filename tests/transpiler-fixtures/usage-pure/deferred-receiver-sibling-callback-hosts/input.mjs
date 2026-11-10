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
