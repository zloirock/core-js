import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a write through a selection of a container and an undefined value lands on the container - the other arm
// holds no slot - so a static read back through the selection owes the written constructor's family
const voided = flag ? {
  C: Object
} : void 0;
voided.C = Map;
export const grouped = voided.C.groupBy([1], x => x);