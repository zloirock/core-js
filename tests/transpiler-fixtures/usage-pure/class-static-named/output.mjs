import _Array$from from "@core-js/pure/actual/array/from";
// A subclass static keeps its receiver and the source evaluation order.
const effects = [];
export const result = (() => {
  class Bag extends Array {}
  const result = _Array$from.call(Bag, [3]);
  return [result[0], result instanceof Bag];
})();