import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// A realm-looking parameter keeps its own flat receiver.
export function read(window) {
  const {
    includes
  } = window.list;
  return includes;
}