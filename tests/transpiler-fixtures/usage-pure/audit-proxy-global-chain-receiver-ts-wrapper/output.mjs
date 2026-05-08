import _globalThis from "@core-js/pure/actual/global-this";
import _includes from "@core-js/pure/actual/instance/includes";
import _Promise from "@core-js/pure/actual/promise/constructor";
var _ref, _ref2;
// TS expression wrappers (`as any`) are transparent to chain-receiver substitution; the
// proxy-global leaf still resolves to its polyfill and the inner `?.` deopts where the
// substituted leaf is always-defined. covers chain receiver + outer instance polyfill
export const a = null == (_ref = _globalThis.foo) ? void 0 : _includes(_ref).call(_ref, 1);
export const b = null == (_ref2 = _Promise?.foo) ? void 0 : _includes(_ref2).call(_ref2, 2);