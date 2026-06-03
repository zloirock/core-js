import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// same proxy-global optional-root guard, but the root is wrapped in a TS cast (`(globalThis as any)`):
// the leaf still resolves to its pure import inside the rebuilt guard text, the TS wrapper is dropped
null == (_ref = _globalThis.list) ? void 0 : _includes(_ref2 = _flatMaybeArray(_ref).call(_ref)).call(_ref2, 1);