import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
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
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
// Reading a constructor through a container preserves its global claim.
// Escaping a nested value does not replace its parent slot.
// A fresh replacement removes the old realm candidate; its URL stays null.
const ns = {
  g: globalThis
};
hand(ns.g.Map);
const nested = {
  a: {
    g: globalThis
  }
};
hand(nested.a.g.Set);
const boxes = [{
  g: globalThis
}];
hand(boxes[0].g.WeakMap);
export function taken() {
  return ns.g.WeakSet;
}
// the escaped VALUE: passing `handed.a.b` out replaces no slot of `handed`, so a static read through
// it resolves as its flat spelling does (`hand(Object); Object.groupBy`)
const handed = {
  a: {
    b: Object
  }
};
hand(handed.a.b);
use(handed.a.b.groupBy([], item => item));
// the replaced slot: the literal no longer says what `rep.g` holds
const rep = {
  g: globalThis
};
rep.g = {
  URL: null
};
hand(rep.g.URL);