import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// two instance polyfills sharing the same optional root - inner reuses outer's guardRef
// via `outerHint.rootRaw -> guardRef` candidate in substituteInner
null == (_ref = null == (_ref2 = fn()) ? void 0 : _at(_ref2).call(_ref2, 0)) ? void 0 : _flatMaybeArray(_ref).call(_ref);