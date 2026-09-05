function f() {
  const Array = [];
  class A extends Array {
    static from(x) {
      return super.from(x);
    }
  }
  return A;
}
