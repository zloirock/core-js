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
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
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
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.url.constructor";
import "core-js/modules/web.url.to-json";
import "core-js/modules/web.url-search-params.constructor";
import "core-js/modules/web.url-search-params.delete";
import "core-js/modules/web.url-search-params.has";
import "core-js/modules/web.url-search-params.size";
// a VALUE read through a container hop that holds a proxy global resolves like every other
// position the same chain appears in. the escape a call argument (or a return) performs re-homes
// the slot the read LANDS on - `ns.g.Map`, not the `ns.g` it navigates through - so the receiver
// walk keeps descending the literal. the two negatives - a slot whose own value was handed out, and
// a slot this file replaced - are method-aware consults answered in usage-pure, which leaves both
// reads native; usage-global keeps resolving and over-injects for the SUBSTITUTION, while the escape
// census reads the replacement itself, so a read landing on it owes no family. each row names its
// OWN global, or one row's family would answer for another's there
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
// the escaped slot ITSELF: `handed.a.b` was passed out, so a static read through it stays raw
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