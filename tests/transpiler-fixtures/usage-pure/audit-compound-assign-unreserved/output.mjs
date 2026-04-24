import _globalThis from "@core-js/pure/actual/global-this";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref2;
// compound assignment `_ref += 10` writes to `_ref` - it must register as a user-owned
// binding so plugin-generated refs (for memoization of receivers / synth-swap rewrites)
// avoid colliding with it. without this, the plugin could pick `_ref` for its own use
// and the subsequent user read / write would clobber the wrong value
_globalThis._ref = 1;
_ref += 10;
console.log(_ref);
_atMaybeArray(_ref2 = [1, 2, 3]).call(_ref2, 0);