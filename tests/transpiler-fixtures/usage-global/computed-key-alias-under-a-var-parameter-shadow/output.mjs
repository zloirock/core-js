import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A parameter owns its key alias even when an outer namesake holds an intrinsic property.
// Its runtime key remains unknown, so a replaced constructor needs its static namespace.
var key = 'name';
export function read(key) {
  var alias = key;
  return Map[alias]([1, 2, 3], value => value % 2);
}