import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An opaque assignment replaces the proven realm before destructuring its constructor.
// Keep the supplied Promise and allSettled slot, including their absence.
function read(source) {
  let realm = globalThis;
  [realm] = source;
  const {
    allSettled
  } = realm.Promise;
  return allSettled;
}