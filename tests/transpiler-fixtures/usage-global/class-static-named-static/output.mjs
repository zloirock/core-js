import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A subclass static keeps its receiver and the source evaluation order.
const effects = [];
export const result = (() => {
  class Bag extends Array {
    static read() {
      return Bag.from([3]);
    }
  }
  return Bag.read() instanceof Bag;
})();