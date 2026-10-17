import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a REASSIGNED container binding resolves like the bare binding-alias canon, lifted to every walk hop: a
// DOMINATING write kills the declared init, and its value walks the remaining path - a pattern, a member
// read, an array wrapper, a class base, a reassigned class, a write behind an effect, a cross-form pattern
// write, a `??=` over an unset binding - so each static loads for that value, never for the init
let rw1 = {
  k: Object
};
rw1 = {
  k: Map
};
const {
  k: {
    groupBy: viaDominating
  }
} = rw1;
export { viaDominating };