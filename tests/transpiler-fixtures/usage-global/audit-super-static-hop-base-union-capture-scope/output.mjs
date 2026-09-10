import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.apply";
import "core-js/modules/es.reflect.construct";
import "core-js/modules/es.reflect.define-property";
import "core-js/modules/es.reflect.delete-property";
import "core-js/modules/es.reflect.get";
import "core-js/modules/es.reflect.get-own-property-descriptor";
import "core-js/modules/es.reflect.get-prototype-of";
import "core-js/modules/es.reflect.has";
import "core-js/modules/es.reflect.is-extensible";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.reflect.prevent-extensions";
import "core-js/modules/es.reflect.set";
import "core-js/modules/es.reflect.set-prototype-of";
import "core-js/modules/es.reflect.to-string-tag";
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
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.concat";
import "core-js/modules/es.array.copy-within";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.fill";
import "core-js/modules/es.array.filter";
import "core-js/modules/es.array.find";
import "core-js/modules/es.array.find-index";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.find-last-index";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.join";
import "core-js/modules/es.array.keys";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.array.slice";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.splice";
import "core-js/modules/es.array.to-reversed";
import "core-js/modules/es.array.to-sorted";
import "core-js/modules/es.array.to-spliced";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.array.values";
import "core-js/modules/es.array.with";
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
import "core-js/modules/esnext.promise.all-keyed";
import "core-js/modules/esnext.promise.all-settled-keyed";
import "core-js/modules/web.dom-collections.iterator";
// the union resolves the base where `extends` CAPTURED it - in the class scope, anchored at the
// class node. a method-local shadow of the alias, or of the container the base is read from, names
// another value that the capture never saw, and a write reaching the slot after the capture cannot
// change what was captured. each line keeps its shadow value live so only the union's family moves

let shadowedAlias;
switch (c) {
  case 1:
    shadowedAlias = Boolean;
    break;
  default:
    shadowedAlias = Array;
}
class OverShadowedAlias extends shadowedAlias {
  static go() {
    const shadowedAlias = Promise;
    return [shadowedAlias, super.from('ab')];
  }
}
let shadowedNs;
switch (c) {
  case 1:
    shadowedNs = {
      Base: Boolean
    };
    break;
  default:
    shadowedNs = {
      Base: Reflect
    };
}
class OverShadowedContainer extends shadowedNs.Base {
  static go() {
    const shadowedNs = {
      Base: WeakMap
    };
    return [shadowedNs, super.ownKeys({})];
  }
}
let writtenAfter = {
  Base: Boolean
};
if (c) writtenAfter = {
  Base: Map
};
class OverWriteAfterCapture extends writtenAfter.Base {
  static go() {
    writtenAfter = {
      Base: Set
    };
    return super.groupBy([1], x => x);
  }
}
export { OverShadowedAlias, OverShadowedContainer, OverWriteAfterCapture };