import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
// An effectful call returning the realm keeps one shared initializer for nested readers.
function getRealm() {
  return globalThis;
}
const {
  Array: {
    prototype: {
      flat
    },
    isArray
  }
} = (effect(), getRealm());
use(flat, isArray);