import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
// control for the SE-tail substitution: when the tail is a LOCAL binding (not a proxy-
// global), `resolveReceiverPolyfill` rejects it via the in-scope check and the SE-tail
// branch falls through to verbatim emission. receiver text stays as-is, no `_X` import
const arr = [1, 2];
_flatMaybeArray(_ref = (0, arr))?.call(_ref, 0);