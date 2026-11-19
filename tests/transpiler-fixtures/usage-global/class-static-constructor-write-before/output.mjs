import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A constructor invoked before capture has already installed the user method.
export const result = (() => {
  class Bag extends Array {
    constructor(...values) {
      super(...values);
      Bag.of = () => 31;
    }
    static make() {
      return new Bag();
    }
  }
  Bag.make();
  const of = Bag.of;
  return of.call(Bag, 6);
})();