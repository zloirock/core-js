import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The realm default supplies the constructor polyfill beside a native nested method.
// A supplied object keeps its own constructor and nested read.
function read({
  Math: {
    floor
  },
  Set: Ctor
} = globalThis) {
  return [floor(1.9), new Ctor()];
}
export const out = read();
export const own = read({
  Math: {
    floor: () => 9
  },
  Set: class Custom {}
});