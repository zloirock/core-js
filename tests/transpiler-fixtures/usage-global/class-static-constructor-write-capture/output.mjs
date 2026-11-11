import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Capturing the inherited static precedes the constructor's own replacement.
export const result = (() => {
  class Bag extends Array {
    constructor(...values) {
      super(...values);
      Bag.of = () => 31;
    }
    static read() {
      return Bag.of(5);
    }
  }
  const of = Bag.of;
  return [of.call(Bag, 6)[0], Bag.read()];
})();