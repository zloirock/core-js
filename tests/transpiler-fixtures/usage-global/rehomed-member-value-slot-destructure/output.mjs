import "core-js/modules/es.object.to-string";
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
import "core-js/modules/web.dom-collections.iterator";
// a slot written with a member of another container (`box.k = NS.inner`) holds what that container
// holds there: a nested pattern reading through the slot reaches the written constructor beside the
// literal's own, and usage-global injects the static for each
const NS = {
  inner: {
    A: Map
  }
};
const box = {
  k: {
    A: Set
  }
};
box.k = NS.inner;
const {
  k: {
    A
  }
} = box;
A.groupBy(src, fn);