import _Array$from from "@core-js/pure/actual/array/from";
// A subclass static keeps its receiver and the source evaluation order.
const effects = [];
export const result = (() => {
  class Bag extends Array {}
  const from = (Bag, _Array$from);
  return from.call(Bag, [3]) instanceof Bag;
})();