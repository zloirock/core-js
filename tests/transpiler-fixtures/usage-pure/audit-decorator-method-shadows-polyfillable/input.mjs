// decorator-defined method named the same as a polyfillable instance method: the
// user-defined member must not be confused for a polyfill receiver.
class A {
  @log at(i) { return [].at(i); }
}
