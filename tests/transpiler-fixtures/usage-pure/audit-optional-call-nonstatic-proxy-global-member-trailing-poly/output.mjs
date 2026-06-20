import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
var _ref, _ref2, _ref3;
// same defect through a proxy-global root: `globalThis.Map` resolves to the polyfillable Map, but
// `.notAMethod` is not a real static, so the `?.` guarding the call must survive. dropping it would
// call undefined and throw where native short-circuits to undefined
const r = null == (_ref = _Map, _ref2 = _ref.notAMethod) ? void 0 : _at(_ref3 = _ref2.call(_ref)).call(_ref3, 0);
r;