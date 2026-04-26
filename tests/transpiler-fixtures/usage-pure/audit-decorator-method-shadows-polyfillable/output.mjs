import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// decorator-defined method named the same as a polyfillable instance method: the
// user-defined member must not be confused for a polyfill receiver.
class A {
  @log
  at(i) {
    var _ref;
    return _atMaybeArray(_ref = []).call(_ref, i);
  }
}