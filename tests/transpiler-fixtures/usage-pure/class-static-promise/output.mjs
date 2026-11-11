import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// A subclass static keeps its receiver and the source evaluation order.
const effects = [];
export const result = (() => {
  class Bag extends Promise {}
  const result = _Promise$withResolvers.call(Bag);
  return result.promise instanceof Bag;
})();