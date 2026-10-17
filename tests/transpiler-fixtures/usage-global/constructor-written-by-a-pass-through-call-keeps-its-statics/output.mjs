import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
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
// a call that hands its argument straight back (`id(Map)`) stores that argument, so a constructor written by
// one through a selection of a name and a literal lands on the name's container, and one written through a
// member alias of a container leaves with the container: either owes the written constructor's family
const id = value => value;
const box = {
  C: Object
};
const either = flag ? box : {
  C: Set
};
either.C = id(Map);
export const grouped = box.C.groupBy([1], x => x);
const nest = {
  inner: {
    C: Object
  }
};
const inner = nest.inner;
inner.C = id(Promise);
use(nest);