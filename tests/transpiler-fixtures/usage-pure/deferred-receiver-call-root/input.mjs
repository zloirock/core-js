// A retained receiver keeps its child claims and source effects through deferred rendering.
export let r;
export const effects = [];
function eff(x) {
  effects[effects.length] = x;
}
function getWin() {
  return globalThis.window;
}
const {
  resolve
} = getWin()?.Promise;
r = typeof resolve;
