class C extends Array {
  static foo() {
    return super["from"]([1]);
  }
}
