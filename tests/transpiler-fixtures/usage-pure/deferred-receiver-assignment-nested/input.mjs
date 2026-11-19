// A retained receiver keeps its child claims and source effects through deferred rendering.
export let r;
export const effects = [];
function eff(x) {
  effects[effects.length] = x;
}
let name;
({
  resolve: {
    name
  }
} = (globalThis.window?.self).Promise);
r = name;
