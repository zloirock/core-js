// a trailing comma in a `super` static's argument list is formatting: the rewrite passes the same
// arguments after the receiver and prints no comma after the last
class X extends Array {
  static make() { return super.from([1, 2],); }
}
