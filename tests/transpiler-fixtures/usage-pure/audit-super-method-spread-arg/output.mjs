import _Array$from from "@core-js/pure/actual/array/from";
// spread arg in super.static call - the spread syntax `...src` is preserved verbatim
// in the rewritten call's argument source
class X extends Array {
  static make(src) {
    return _Array$from.call(this, ...src);
  }
}