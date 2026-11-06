import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a binding a pattern takes off a slot of a literal spelled in place that holds a container by name is that
// container - an array literal's, an object literal's - so a constructor written through it owes its family
// to a static read back through the container's own name
const listed = {
  C: Object
};
const [viaArray] = [listed];
viaArray.C = Map;
export const grouped = listed.C.groupBy([1], x => x);
const spelled = {
  C: Object
};
const {
  x: viaObject
} = {
  x: spelled
};
viaObject.C = Promise;
export const settled = spelled.C.allSettled([]);