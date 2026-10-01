import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Reading a different field of a returned object does not expose its constructor slot.
// The contained constructor stays narrow; no static is used.
const source = {
  read() {
    return {
      Constructor: Map,
      value: 1
    };
  }
};
export const value = source.read().value;