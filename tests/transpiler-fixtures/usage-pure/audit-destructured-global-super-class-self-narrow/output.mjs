import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _self from "@core-js/pure/actual/self";
var _ref;
// Same destructured-global superclass shape, but the proxy-global root is `self` instead of
// `globalThis` - confirms the in-place-rewrite recovery is not specific to one root. `at` must
// narrow through the inheritance to the array instance polyfill.
const {
  Array
} = _self;
class X extends Array {}
_atMaybeArray(_ref = new X()).call(_ref, 0);