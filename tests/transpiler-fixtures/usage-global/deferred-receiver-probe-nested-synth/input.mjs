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
  function f({
    from
  } = Array) {
    return from([7])[0];
  }
  eff(f());
})?.Promise;
r = typeof resolve;
