import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A method borrowed from an opted-out constructor needs a compatible instance.
// Another method on that instance follows it. Separate constructors and statics
// in this file can still use their own polyfills.
export function read(key) {
  // core-js-disable-next-line
  const Native = Map;
  const shared = new Map();
  shared.set(key, 7);
  const separate = new Map();
  return [Native.prototype.has.call(shared, key), Map.prototype.get.call(shared, key), shared instanceof Map, separate.get(key), Map.groupBy([key], x => x).get(key)];
}