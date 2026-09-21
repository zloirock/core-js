import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A yielded container is filled per call, so a second call site with another constructor narrows
// neither: each read resolves to its own call's argument and injects that static alone.
function box(v) {
  return [v];
}
export const first = box(Map)[0].groupBy([1], x => x);
export const second = box(Array)[0].of(2);