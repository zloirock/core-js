// A retained receiver keeps its child claims and source effects through deferred rendering.
export let r;
export const effects = [];
function eff(x) {
  effects[effects.length] = x;
}
let held;
const {
  resolve
} = (held = globalThis.window)?.Promise;
r = typeof resolve;
