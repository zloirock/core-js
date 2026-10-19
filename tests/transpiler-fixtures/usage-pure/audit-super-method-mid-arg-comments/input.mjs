// a comment between two arguments of a `super` static survives the rewrite between the same two
class X extends Array {
  static of(x, y) { return super.of(x, /* between */ y); }
}
