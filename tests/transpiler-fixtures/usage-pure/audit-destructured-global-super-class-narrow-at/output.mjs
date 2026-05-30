import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// Same destructured-global superclass shape as the sibling fixture, but the instance
// method is `at` - confirms the inheritance narrow reaches a different Array polyfill.
const {
  Array
} = _globalThis;
class X extends Array {}
_atMaybeArray(_ref = new X()).call(_ref, 0);