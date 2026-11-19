// A retained receiver keeps its child claims and source effects through deferred rendering.
export let r;
export const effects = [];
function eff(x) {
  effects[effects.length] = x;
}
function getWin(cb) {
  cb();
  return globalThis.window;
}
const {
  resolve
} = getWin(() => {
  const {
    fromEntries
  } = Object;
  eff(fromEntries([["x", 7]]).x);
})?.Promise;
r = typeof resolve;
