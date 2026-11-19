import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// A retained receiver keeps its child claims and source effects through deferred rendering.
export let r;
export const effects = [];
function eff(x) {
  effects[effects.length] = x;
}
function getWin(cb) {
  cb();
  return _globalThis.window;
}
const resolve = ((null == getWin(() => {
  function f({
    from
  } = {
    from: _Array$from
  }) {
    return from([7])[0];
  }
  eff(f());
}) ? void 0 : _Promise).resolve, _Promise$resolve);
r = typeof resolve;