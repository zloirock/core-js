import _Array$from from "@core-js/pure/actual/array/from";
// static class field initialised with a polyfilled built-in: the initializer is
// scanned and rewritten in pure-mode like any other top-level expression.
class C {
  static items = _Array$from([1, 2, 3]);
}