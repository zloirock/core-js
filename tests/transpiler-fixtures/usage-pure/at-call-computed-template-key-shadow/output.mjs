// a computed method key `[`at${""}`]` statically resolves to "at", so the class owns an `at`
// method that shadows the inherited Array.prototype.at - this.at must NOT be rewritten to the
// pure helper (which carries array-at semantics, not the own method's)
class C extends Array {
  [`at${""}`]() {}
  foo() {
    return this.at(0);
  }
}