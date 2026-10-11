import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a write through a selection of a container literal and a value holding no slot - a nullish arm, an `&&`'s
// left, the value only where it is falsy - lands on the container whenever it lands anywhere, so a static
// read back through the selection loads the written constructor's static
const grouped = flag ? {
  C: Map
} : null;
grouped.C = Object;
export const byParity = grouped.C.groupBy([1, 2], x => x % 2);
const listed = ready && {
  C: Promise
};
listed.C = Array;
export const copied = listed.C.from([1]);