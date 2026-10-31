class C extends Array {
  at(i) {
    return 42;
  }
  foo() {
    return this.at(0);
  }
}