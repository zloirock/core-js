import _Array$of from "@core-js/pure/actual/array/of";
// A subclass static keeps its receiver and the source evaluation order.
const effects = [];
export const result = (() => {
  class Bag extends Array {}
  const B = Bag;
  return _Array$of.call(B, 3) instanceof Bag;
})();