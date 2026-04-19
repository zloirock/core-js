import _Array$from from "@core-js/pure/actual/array/from";
// spread arg in super.static call — sliceBetweenParens returns `...src` as-is
class X extends Array {
  static make(src) {
    return _Array$from.call(this, ...src);
  }
}