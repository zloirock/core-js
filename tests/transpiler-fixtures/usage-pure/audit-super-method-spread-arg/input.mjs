// spread arg in super.static call - sliceBetweenParens returns `...src` as-is
class X extends Array {
  static make(src) { return super.from(...src); }
}
