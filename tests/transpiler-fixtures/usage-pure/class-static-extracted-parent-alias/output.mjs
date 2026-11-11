import _Array$of from "@core-js/pure/actual/array/of";
// A builtin receiver escape keeps its identity through a class alias.
export const result = (() => {
  class Base extends Array {}
  const B = Base;
  class Bag extends B {
    read() {
      return _Array$of.call(Bag, 5);
    }
  }
  const of = (B, _Array$of);
  return [new Bag().read()[0], of.call(B, 6)[0]];
})();