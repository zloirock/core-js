// only-comment argslist - the literal text between the parens (the comment) is preserved
// as the call's argument source, with no leading separator since the call has no args
class X extends Array {
  static make() { return super.from(/* only */); }
}
