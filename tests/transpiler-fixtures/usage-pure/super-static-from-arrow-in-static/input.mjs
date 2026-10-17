class A extends Array {
  static toArrays(items) {
    return items.map(x => super.from([x]));
  }
}
