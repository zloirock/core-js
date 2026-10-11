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
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// in a `||` chain over fresh containers the first always yields: every later level is dead, and its
// constructor injects nothing, as in the chain over bare built-ins
export const {
  C: {
    groupBy
  }
} = {
  C: Map
} || {
  C: Object
} || {
  C: Set
};
export const settled = ({
  C: Promise
} || {
  C: Array
} || {
  C: Number
}).C.allSettled;