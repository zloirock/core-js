// A retained receiver keeps its child claims and source effects through deferred rendering.
export let r;
export const effects = [];
function eff(x) {
  effects[effects.length] = x;
}
function call(cb) {
  cb();
}
const {
  resolve
} = (call(() => {
  const {
    fromEntries
  } = Object;
  eff(fromEntries([["x", 7]]).x);
}), globalThis.window)?.Promise;
r = typeof resolve;
