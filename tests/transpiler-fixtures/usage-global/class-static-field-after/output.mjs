import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// Static fields run in order: this initializer sees the inherited method,
// before the later field replaces it.
const effects = [];
export const result = (() => {
  class Bag extends Array {
    static result = Bag.from([3]);
    static from = () => 19;
  }
  return Bag.result instanceof Bag;
})();