// spread arg in super.static call - the spread syntax `...src` is preserved verbatim
// in the rewritten call's argument source
class X extends Array {
  static make(src) { return super.from(...src); }
}
