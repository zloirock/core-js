class A extends Array {
  static first() {
    return (super.at)(0);
  }
  static fromList() {
    return (super.from)([1, 2, 3]);
  }
}
