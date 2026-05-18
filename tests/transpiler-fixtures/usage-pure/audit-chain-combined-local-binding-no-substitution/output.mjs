import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// control for the direct-substitution branch: a LOCAL binding (not a proxy-global) must
// stay verbatim in the chain template. `resolveReceiverPolyfill` returns null for any
// Identifier shadowed by an in-scope binding via `scope.hasBinding`, so the directSubst
// check falls through and the receiver text comes from `unwrapParensSrc` unchanged
const arr = [1, 2];
null == arr || null == (_ref = _flatMaybeArray(arr)) ? void 0 : _includesMaybeArray(_ref2 = _ref.call(arr)).call(_ref2, 1);