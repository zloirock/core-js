import _Array$from from "@core-js/pure/actual/array/from";
// A subclass static keeps its receiver and the source evaluation order.
const effects = [];
export const result = (() => {
  class Base extends Array {}
  class Bag extends Base {}
  return _Array$from.call(Bag, [3]) instanceof Bag;
})();