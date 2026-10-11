import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.define-getter";
import "core-js/modules/es.object.define-setter";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.freeze";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.get-own-property-descriptor";
import "core-js/modules/es.object.get-own-property-descriptors";
import "core-js/modules/es.object.get-own-property-names";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.get-prototype-of";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.is";
import "core-js/modules/es.object.is-extensible";
import "core-js/modules/es.object.is-frozen";
import "core-js/modules/es.object.is-sealed";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.lookup-getter";
import "core-js/modules/es.object.lookup-setter";
import "core-js/modules/es.object.prevent-extensions";
import "core-js/modules/es.object.seal";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.reject";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.promise.race";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
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
import "core-js/modules/esnext.promise.all-keyed";
import "core-js/modules/esnext.promise.all-settled-keyed";
import "core-js/modules/web.dom-collections.iterator";
// a member read off a name that holds the realm (`const g = globalThis; g.Map`) is the global it names, so a
// constructor written that way through a selection of a name and a literal lands on the name's container, and
// one written through a member alias of a container leaves with it: either owes its family
const g = globalThis;
const box = {
  C: Object
};
const either = flag ? box : {
  C: Set
};
either.C = g.Map;
export const grouped = box.C.groupBy([1], x => x);
const nest = {
  inner: {
    C: Object
  }
};
const inner = nest.inner;
inner.C = g.Promise;
use(nest);