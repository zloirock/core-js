import _Array$of from "@core-js/pure/actual/array/of";
// a comment between two arguments of a `super` static survives the rewrite between the same two
class X extends Array {
  static of(x, y) {
    return _Array$of.call(this, x, /* between */y);
  }
}