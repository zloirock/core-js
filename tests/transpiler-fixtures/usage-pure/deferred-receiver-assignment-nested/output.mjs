import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
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
} = ({} = ((null == _globalThis.window ? void 0 : _self).Promise, _Promise), {
  resolve: {
    name: _nameMaybeFunction(_Promise$resolve)
  }
}));
r = name;