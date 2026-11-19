import _Array$of from "@core-js/pure/actual/array/of";
// A subclass static keeps its receiver and the source evaluation order.
const effects = [];
export const result = (() => {
  const Bag = class extends Array {};
  return _Array$of.call(Bag, 3) instanceof Bag;
})();