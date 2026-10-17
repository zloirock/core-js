import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An opaque assignment replaces the initial realm before the nested assignment.
// Read Map.groupBy from the supplied value without reviving the old realm candidate.
function read(source) {
  let realm = globalThis;
  [realm] = source;
  let method;
  ({
    Map: {
      groupBy: method
    }
  } = realm);
  return typeof method;
}