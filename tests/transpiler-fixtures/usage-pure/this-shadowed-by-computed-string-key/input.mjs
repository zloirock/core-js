class A extends Array {
  ['at']() { return 42; }
  foo() { return this.at(0); }
}
