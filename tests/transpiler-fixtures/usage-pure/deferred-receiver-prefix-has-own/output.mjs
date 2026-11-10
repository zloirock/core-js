import _globalThis from "@core-js/pure/actual/global-this";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// A retained receiver keeps its child claims and source effects through deferred rendering.
export let r;
export const effects = [];
function eff(x) {
  effects[effects.length] = x;
}
const list = [1];
const resolve = ((_Object$hasOwn(list, 0), null == _globalThis.window ? void 0 : _Promise).resolve, _Promise$resolve);
r = typeof resolve;