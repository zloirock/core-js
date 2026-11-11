import _Array$from from "@core-js/pure/actual/array/from";
// A subclass static keeps its receiver and the source evaluation order.
const effects = [];
export const result = (() => {
  class Base extends Array {}
  class Middle extends Base {}
  class Bag extends Middle {
    static read() {
      return _Array$from.call(this, [3]);
    }
  }
  return Bag.read() instanceof Bag;
})();