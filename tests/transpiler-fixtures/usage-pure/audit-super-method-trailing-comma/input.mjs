// trailing comma in super.static argslist - argument-source extraction keeps every byte
// between the parens, so the trailing comma survives unchanged in the rewritten call
class X extends Array {
  static make() { return super.from([1, 2],); }
}
