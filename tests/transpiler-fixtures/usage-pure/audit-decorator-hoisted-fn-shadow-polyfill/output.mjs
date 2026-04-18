class A {
  @dec(function () {
    function Array() {
      return {
        from: () => 1
      };
    }
    return Array.from([1]);
  })
  m() {}
}