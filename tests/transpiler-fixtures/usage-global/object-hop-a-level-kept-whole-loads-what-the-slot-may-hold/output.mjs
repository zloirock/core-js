import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
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
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/esnext.promise.all-keyed";
import "core-js/modules/esnext.promise.all-settled-keyed";
import "core-js/modules/web.dom-collections.iterator";
// a level the pure build keeps whole - a getter body with an effect, a spread or an unnameable key that
// could override the slot, a write to a numeric slot - is still read through in usage-global, which loads
// what the slot MIGHT hold: over-injection is its safe side
const other = {};
const {
  w: {
    WeakSet: keptByGetterEffect
  }
} = {
  get w() {
    mark();
    return globalThis;
  }
};
function keptBySpread(extra) {
  const {
    w: {
      Array: {
        of: kept
      }
    }
  } = {
    w: globalThis,
    ...extra
  };
  return kept;
}
function keptByKey(key) {
  const ns = {
    Q: Array,
    [key]: Map
  };
  const {
    Q: {
      from: kept
    }
  } = ns;
  return kept;
}
const holder = {
  0: globalThis
};
holder[0] = other;
const {
  0: {
    Promise: keptByWrite
  }
} = holder;
function mark() {}
export default [keptByGetterEffect, keptBySpread({}), keptByKey('Q'), keptByWrite];