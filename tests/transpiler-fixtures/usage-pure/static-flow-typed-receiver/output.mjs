import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
// Type assertions do not remove reachable values or the source receiver check.
const {
  allSettled: {
    name
  }
} = ({} = ((null == _globalThis.window ? void 0 : _self).Promise, _Promise), {
  allSettled: {
    name: _nameMaybeFunction(_Promise$allSettled)
  }
});
use(name);
export {};