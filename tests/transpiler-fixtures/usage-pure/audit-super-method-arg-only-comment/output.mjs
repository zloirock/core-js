import _Array$from from "@core-js/pure/actual/array/from";
// an argument list holding only a comment is a ZERO-arg call: the rewrite passes the receiver
// alone, with no separator after it, and the comment survives the rewrite
class X extends Array {
  static make() {
    return _Array$from.call(this) /* only */;
  }
}