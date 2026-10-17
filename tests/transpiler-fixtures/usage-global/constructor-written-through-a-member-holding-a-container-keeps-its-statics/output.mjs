import "core-js/modules/es.object.group-by";
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
// a member a container is stored into (`holder.v = box.inner`, or a pattern storing into the member) holds that
// container, so a constructor written through the member owes its family to a static read back through the
// container's own path
const box = {
  inner: {
    C: Object
  }
};
const holder = {};
holder.v = box.inner;
holder.v.C = Map;
export const grouped = box.inner.C.groupBy([1], x => x);
const nest = {
  inner: {
    C: Object
  }
};
const keeper = {};
({
  inner: keeper.v
} = nest);
keeper.v.C = Promise;
export const settled = nest.inner.C.allSettled([]);