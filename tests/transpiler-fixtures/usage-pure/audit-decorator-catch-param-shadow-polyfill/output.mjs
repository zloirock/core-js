class A {
  @dec(function () {
    try {
      throw 1;
    } catch (Array) {
      return Array.from([1]);
    }
  })
  m() {}
}