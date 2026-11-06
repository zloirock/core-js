import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
type Store = {
  kind: 'map';
  data: Map<string, number>;
} | {
  kind: 'list';
  data: number[];
};
declare const flag: boolean;
export function exitConditional(store: Store) {
  if (typeof Promise != 'undefined' ? store.kind !== 'map' : flag) return;
  return store.data.forEach(log);
}