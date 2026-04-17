const Klass = (() => {
  @tagged
  class Inner {
    values = Array.from([1, 2, 3]);
  }
  return Inner;
})();
