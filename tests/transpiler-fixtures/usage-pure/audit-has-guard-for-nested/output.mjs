import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// two polyfills with the same optional root: outer records guardRef, inner reuses it
// via findOuterGuardRef. tests #byGuardedRoot O(1) lookup + identity-based match
null == (_ref = fn()) ? void 0 : _flatMaybeArray(_ref).call(_ref, null == (_ref2 = fn()) ? void 0 : _at(_ref2).call(_ref2, 0));