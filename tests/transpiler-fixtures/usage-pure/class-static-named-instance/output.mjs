import _Array$of from "@core-js/pure/actual/array/of";
// A subclass static keeps its receiver and the source evaluation order.
const effects = [];
export const result = (() => {
  class Bag extends Array {
    read() {
      return _Array$of.call(Bag, 4);
    }
  }
  const result = new Bag().read();
  return [result[0], result instanceof Bag];
})();