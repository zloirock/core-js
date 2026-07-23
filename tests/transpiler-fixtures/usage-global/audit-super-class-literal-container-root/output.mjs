import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.promise.race";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a super-class reached through a global alias that a LITERAL container binds names the same proxy
// global a bare alias does, so the static super-call must inject its method module. this is a
// different shape from the key-path form (`{ Promise: P } = globalThis`), which reads a slot OFF the
// global - a container carries the global as its slot VALUE. the resolution NEGATIVES live in the
// usage-pure sibling fixture: in this method an unresolved receiver still injects under the
// over-inject bias, so absence could not discriminate here. distinct method per line.
const [arrayWrap] = [globalThis];
const {
  slot: objectWrap
} = {
  slot: globalThis
};
const [[nestedWrap]] = [[globalThis]];
export class ViaArray extends arrayWrap.Promise {
  static m() {
    return super.any([]);
  }
}
export class ViaObject extends objectWrap.Promise {
  static m() {
    return super.allSettled([]);
  }
}
export class ViaNested extends nestedWrap.Promise {
  static m() {
    return super.race([]);
  }
}