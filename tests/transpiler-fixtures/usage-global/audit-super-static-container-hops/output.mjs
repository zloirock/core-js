import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.try";
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
import "core-js/modules/web.dom-collections.iterator";
// the container a `super.<static>` base is read from resolves through the same hops the value canon
// walks: an alias to the container, a member read of it, an effect-wrapped base, and a dominating
// reassignment whose reaching value is the live container. the subresolver handed a hop's init back
// verbatim and indexed nothing, and it bailed flat where its super-class sibling kept resolving.
// one static family per line - the import set is the only observable here
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