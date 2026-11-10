// A retained receiver keeps its child claims and source effects through deferred rendering.
export let r;
export const effects = [];
function eff(x) {
  effects[effects.length] = x;
}
const list = [1];
const w = globalThis.window;
const {
  resolve
} = (list.flat(), eff("p"), w).Promise;
r = typeof resolve;
