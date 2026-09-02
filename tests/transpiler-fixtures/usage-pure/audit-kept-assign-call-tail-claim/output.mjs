import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref;
// a claimable static method inside a kept-assign call tail claims INSIDE the outer guard's
// memo body (the ponyfill canon both emitters read through the memo - a raw invocation would
// miss the polyfill exactly where the target engine lacks the native)
let k;
export const keptFrom = null == (k = _globalThis.window) ? void 0 : _atMaybeArray(_ref = _Array$from([4])).call(_ref, 0);
// control: the same navigation claims normally when nothing captures it
export const liveIsArray = _self.Array.isArray([4]);