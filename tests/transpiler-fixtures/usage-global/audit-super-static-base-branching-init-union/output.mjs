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
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.promise.all-keyed";
import "core-js/modules/esnext.promise.all-settled-keyed";
import "core-js/modules/web.dom-collections.iterator";
// a bare `extends` alias is ambiguous through more than a reassignment: a branching INIT, a
// short-circuit default and a switch that writes every arm each leave the capture undecided, and
// the union owes each reachable constructor's statics there too. an IIFE around such an alias
// forwards the same set. the arm the alias starts on owns no static of the read key

let viaTernary = c ? Boolean : Array;
class OverTernary extends viaTernary {
  static go() {
    return super.from('ab');
  }
}
let viaDefault = c && Boolean || Promise;
class OverDefault extends viaDefault {
  static go() {
    return super.allSettled([]);
  }
}
let viaSwitch;
switch (c) {
  case 1:
    viaSwitch = Boolean;
    break;
  default:
    viaSwitch = Reflect;
}
class OverSwitch extends viaSwitch {
  static go() {
    return super.ownKeys({});
  }
}
let viaIife = Boolean;
if (c) viaIife = Map;
class OverIife extends (() => viaIife)() {
  static go() {
    return super.groupBy([1], x => x);
  }
}
export { OverTernary, OverDefault, OverSwitch, OverIife };