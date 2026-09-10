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
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
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
import "core-js/modules/esnext.promise.all-keyed";
import "core-js/modules/esnext.promise.all-settled-keyed";
import "core-js/modules/web.dom-collections.iterator";
// the written-slot boundary for a nav rooted at a container LITERAL. such a binding holds a
// container exactly as a bare literal does, so the census indexes it through the SAME literal and a
// slot the source REPLACES stops the read - object, array and class-expression roots alike. the
// consult is method-aware like every other one: pure leaves the read native, global over-injects -
// but the escape census reads the replacement, so the read owes no family on either flavor.
// the positives pin the other side - the keys the literal spells ABOVE the name are not the name's
// slots, and an unrelated slot on the same container leaves the read resolving
const obj = {
  h: {
    g: globalThis
  }
}.h;
obj.g = {
  Map: null
};
hand(obj.g.Map);
const box = [{
  g: globalThis
}][0];
box.g = {
  Set: null
};
hand(box.g.Set);
const statics = class {
  static h = {
    g: globalThis
  };
}.h;
statics.g = {
  WeakMap: null
};
hand(statics.g.WeakMap);
// `kept.h` is the literal's own key, above the name - the read never goes through it
const kept = {
  h: {
    g: globalThis
  }
}.h;
kept.h = elsewhere;
hand(kept.g.WeakSet);
// an unrelated slot on the very container the read descends
const aside = {
  h: {
    g: globalThis
  }
}.h;
aside.tag = 1;
hand(aside.g.Promise);