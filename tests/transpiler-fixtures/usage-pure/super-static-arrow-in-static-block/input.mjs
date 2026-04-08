class A extends Array {
  static {
    [].map(x => super.from([x]));
  }
}
