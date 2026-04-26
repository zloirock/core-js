import _globalThis from "@core-js/pure/actual/global-this";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref2;
// user code writes to `_ref` via compound assignment: that name is reserved for the
// user, plugin-generated temporaries must pick a different identifier so the user's
// read / write keep their original value
_globalThis._ref = 1;
_ref += 10;
console.log(_ref);
_atMaybeArray(_ref2 = [1, 2, 3]).call(_ref2, 0);