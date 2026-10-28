import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
// A guarded realm memo drops only proven hops; user receivers and effectful keys stay native.
const fromRealm = null == (_ref = _globalThis.window) ? void 0 : _includes(_ref2 = _ref.__dispatchList).call(_ref2, 2);
const effectful = null == (_ref3 = _globalThis.window) ? void 0 : _at(_ref4 = _ref3[key(), 'self'].__dispatchList).call(_ref4, 0);
let held;
const kept = null == (held = _globalThis.window) ? void 0 : _includes(_ref5 = held.__dispatchList).call(_ref5, 1);
const foreign = user == null ? void 0 : _includes(_ref6 = user.self.list).call(_ref6, 2);