import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Map iterates pairs, so its inferred element cannot satisfy a string constraint.
type Result<T> = T extends Iterable<infer U extends string> ? string : number[];
export function read(value: Result<Map<string, number>>) {
  return value.at(0);
}
export const result = read([7]);