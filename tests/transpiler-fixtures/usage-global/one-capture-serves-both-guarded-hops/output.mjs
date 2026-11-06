import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
// Each getter may return a different receiver. Both guards read their own slot once.
export function read(second) {
  const {
    set: {
      WeakSet: weak
    },
    map: {
      Promise: promise
    }
  } = {
    get set() {
      return globalThis;
    },
    get map() {
      return second;
    }
  };
  return [weak, promise];
}