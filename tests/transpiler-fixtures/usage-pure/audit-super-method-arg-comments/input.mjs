// a `super` static rewritten onto its receiver keeps the comments around its argument, the one
// ahead of it and the one behind it, each on its own side
class X extends Array {
  static make() {
    return super.from(/* pre */ [1, 2] /* post */);
  }
}
