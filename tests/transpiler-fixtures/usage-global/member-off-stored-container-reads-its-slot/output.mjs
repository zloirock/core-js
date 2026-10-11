import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a static read off a slot of a container stored in the same expression reads that container, as its
// destructure twin does: the slot's static is injected, through a `||` the store decides too
var B;
export const grouped = (B = {
  C: Map
}).C.groupBy;
export const settled = (B = [Promise])[0].allSettled;
export const integer = ((B = {
  C: Number
}) || {
  C: Object
}).C.isInteger;
export const {
  C: {
    fromEntries
  }
} = B = {
  C: Object
};