import _Array$from from "@core-js/pure/actual/array/from";
const Klass = (() => {
  @tagged
  class Inner {
    values = _Array$from([1, 2, 3]);
  }
  return Inner;
})();