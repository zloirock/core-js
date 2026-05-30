import _globalThis from "@core-js/pure/actual/global-this";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// Destructured-global superclass with a different constructor than Array: String here, so the
// recovery is shown to be constructor-agnostic. `at` must narrow through the inheritance to the
// String instance polyfill (string-specific helper) despite the proxy global being rewritten to its UID.
const {
  String
} = _globalThis;
class X extends String {}
_atMaybeString(_ref = new X()).call(_ref, 0);