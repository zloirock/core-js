class A extends Map {
  static f() {
    class B extends Set {
      static g() { return super.from([1]); }
    }
    return super.groupBy([], x => x);
  }
}
