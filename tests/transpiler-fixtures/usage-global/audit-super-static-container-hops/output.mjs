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
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/esnext.promise.all-keyed";
import "core-js/modules/esnext.promise.all-settled-keyed";
import "core-js/modules/web.dom-collections.iterator";
// Exported subclasses resolve their bases through aliases, members, effects and reassignment.
// Each exported class hands its base out: Map and Promise load their whole families, while Object
// and Array, constructors core-js does not polyfill, load the statics their super calls name alone.
const mapNs = {
  Base: Map
};
const viaAlias = mapNs;
class OverAlias extends viaAlias.Base {
  static grouped() {
    return super.groupBy([1], x => x);
  }
}
const outer = {
  inner: {
    Base: Object
  }
};
const viaMember = outer.inner;
class OverMember extends viaMember.Base {
  static keyed() {
    return super.groupBy([2], x => x);
  }
}
const arrayNs = {
  Base: Array
};
let effects = 0;
class OverEffectfulBase extends (effects++, arrayNs.Base) {
  static awaited() {
    return super.fromAsync([3]);
  }
}
let reassigned = {
  Base: WeakMap
};
reassigned = {
  Base: Promise
};
class OverReaching extends reassigned.Base {
  static attempted() {
    return super.try(() => 4);
  }
}
export { OverAlias, OverMember, OverEffectfulBase, OverReaching, effects };