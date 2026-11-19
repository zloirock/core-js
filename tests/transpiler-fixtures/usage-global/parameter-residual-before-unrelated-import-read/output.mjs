import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A body read does not own the receiver of a parameter default.
import realm from "@core-js/pure/actual/global-this";
import groupBy from "@core-js/pure/actual/map/group-by";
let custom, method;
export function read(value = {
  custom
} = realm.Map) {
  method = groupBy;
  return value;
}