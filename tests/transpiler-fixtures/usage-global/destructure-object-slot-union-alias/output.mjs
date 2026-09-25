import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an alias bound through an OBJECT slot holds every arm of the slot's branching value, as the
// array-slot and reassignment spellings of the same union do: the static read reaches each arm
// (inject-if-might in usage-global; usage-pure guards the read on each arm it can name, and a
// default that cannot fire leaves the paired value's static served outright)
// one static per row, so every row is observable by its own module
const {
  a: A
} = {
  a: c ? Array : Map
};
export const viaTernary = A.from([1]);
const {
  b: B
} = {
  b: m || Array
};
export const viaLogical = B.of(2);
const {
  d: D = Map
} = {
  d: Object
};
export const viaDefault = D.hasOwn({}, 'k');
const {
  n: {
    e: E
  }
} = {
  n: {
    e: c ? Map : Object
  }
};
export const viaNested = E.groupBy([4], x => x);