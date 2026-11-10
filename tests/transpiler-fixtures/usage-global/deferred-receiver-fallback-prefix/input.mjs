// A retained receiver keeps its child claims and source effects through deferred rendering.
export let r;
export const effects = [];
function eff(x) {
  effects[effects.length] = x;
}
const {
  resolve
} = ((eff("p"), globalThis.window)?.self).Promise ?? {};
r = typeof resolve;
