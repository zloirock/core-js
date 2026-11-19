import "core-js/modules/es.promise.with-resolvers";
// A subclass static keeps its receiver and the source evaluation order.
const effects = [];
export const result = (() => {
  class Bag extends Promise {}
  const result = Bag.withResolvers();
  return result.promise instanceof Bag;
})();