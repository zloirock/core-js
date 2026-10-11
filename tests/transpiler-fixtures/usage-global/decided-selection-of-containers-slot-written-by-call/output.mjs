import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.chunks";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.iterator.join";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.iterator.windows";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a call the binding of a decided selection of containers is handed to, writing the slot through its
// parameter before the read, puts its value there as it does for a plain container: the written
// constructor's static is loaded, and the static of the container the selection yields is not
const grouped = typeof Symbol != 'undefined' ? {
  C: Map
} : {
  C: Set
};
function regroup(target) {
  target.C = Object;
}
regroup(grouped);
export const byParity = grouped.C.groupBy([1, 2], x => x % 2);
const listed = {
  C: Iterator
} || {
  C: Set
};
function relist(target) {
  target.C = Array;
}
relist(listed);
export const copied = listed.C.from([1]);