// mid-arg comments (between args, not around them) must survive: argument-source
// extraction takes every byte between the parens, including comments and whitespace
// that fall between consecutive arguments
class X extends Array {
  static of(x, y) { return super.of(x, /* between */ y); }
}
