class A extends Array {
  static accessor at = 1;
  foo() {
    return this.at(0);
  }
}
