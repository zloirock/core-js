import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
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
import "core-js/modules/es.iterator.from";
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
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a write through a name holding a selection lands on whichever arm runs - an arm behind an effect prefix or
// a chain assignment as well as a bare one - so a static read back through that arm's container loads the
// written constructor's statics
const listed = {
  C: Array
};
const other = {
  C: Object
};
const picked = flag ? (init(), listed) : other;
picked.C = Iterator;
export const copied = listed.C.from([1]);
const first = {
  C: Object
};
const second = {
  C: Object
};
const either = (prep(), first) || second;
either.C = Map;
export const grouped = first.C.groupBy([1], item => item);
const held = {
  C: Object
};
const spare = {
  C: Object
};
let tmp;
const chosen = flag ? tmp = held : spare;
chosen.C = Promise;
export const settled = held.C.allSettled([]);