import _at from "@core-js/pure/actual/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
// when an instance-method chain is constructed with `new`, the polyfill
// must keep the `new` keyword instead of collapsing to a regular call,
// otherwise the user's constructor invocation silently turns into a call.
var X = new (null == (_ref = _flatMaybeArray(arr)) ? void 0 : _at(_ref()))(1, 2);