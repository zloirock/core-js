import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An opaque array assignment replaces the initial realm before the constructor read.
// The supplied value keeps its own Map and groupBy; the dead initializer adds no guard.
function read(source) {
  let realm = globalThis;
  [realm] = source;
  return realm.Map.groupBy([1, 2, 3], value => value % 2);
}