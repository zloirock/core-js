import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// a claimable static method inside a kept-assign call tail claims INSIDE the outer guard's
// memo body (the ponyfill canon both emitters read through the memo - a raw invocation would
// miss the polyfill exactly where the target engine lacks the native)
let k;
export const keptFrom = null == (_ref = k = _globalThis.window) ? void 0 : _at(_ref2 = _Array$from([4])).call(_ref2, 0);
// control: the same navigation claims normally when nothing captures it
export const liveIsArray = _globalThis.Array.isArray([4]);