import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
// Capturing a realm-producing call keeps its effects before both property reads.
function get() {
  effect();
  return globalThis;
}
const {
  Array: {
    prototype: {
      flat
    },
    isArray
  }
} = get();
export { flat, isArray };