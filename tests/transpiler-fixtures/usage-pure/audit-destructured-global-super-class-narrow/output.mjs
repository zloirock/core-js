import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// Array comes from a destructured proxy global, then serves as a class superclass.
// The instance method must narrow through the inheritance to the array polyfill even
// though the proxy global was rewritten to its UID before the superclass was resolved.
const {
  Array
} = _globalThis;
class X extends Array {}
_includesMaybeArray(_ref = new X()).call(_ref, 0);