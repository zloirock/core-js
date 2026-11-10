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
const result = ({
  at
} = source(() => {
  const {
    fromEntries
  } = Object;
  eff(fromEntries([["x", 7]]).x);
}), at.call([3], 0));
r = result;
