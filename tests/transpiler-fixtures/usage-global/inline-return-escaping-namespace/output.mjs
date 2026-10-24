import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Exporting the subclass exposes every static of its possible base, so every returned constructor
// escapes: `Map` loads its whole family, while `Array`, a native constructor with no entry of its
// own, loads nothing.
export class ArrayChild extends (() => {
  if (flag) return Array;
  return customArray;
})() {}
export class MapChild extends (() => {
  if (flag) return Map;
  return customMap;
})() {}