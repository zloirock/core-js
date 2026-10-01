import "core-js/modules/es.object.keys";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.push";
// A guarded export keeps the source bindings public and capture temporaries private.
// Earlier claims survive export separation; user getters retain their read order.
// The Array getter proves the prototype family, so the instance claim needs no String polyfill.
const log = [];
const source = {
  get Array() {
    log.push('Array');
    return Array;
  },
  get Object() {
    log.push('Object');
    return Object;
  },
  get other() {
    log.push('other');
    return 7;
  }
};
let held;
export const {
  Array: {
    prototype: {
      at
    }
  },
  Object: {
    keys
  },
  other
} = held = (log.push('source'), source);