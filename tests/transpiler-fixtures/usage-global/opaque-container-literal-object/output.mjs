import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An unknown key selects an Object constructor; reading groupBy does not expose its namespace.
export function read(key) {
  return [Object][key].groupBy([1, 2], value => value % 2);
}