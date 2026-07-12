import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// usage-global resolves a static container the same canonical way pure does, then injects the
// resolved global's polyfill: a computed static-string key overrides (last-wins), a duplicate field
// is last-wins, and a super-class reached through a namespace member resolves its constructor

// a computed static-string key overrides the earlier plain field -> inject the LAST static's method
class Computed {
  static M = Array;
  static ["M"] = Promise;
}
const {
  M: {
    allSettled
  }
} = Computed;
export const viaComputed = allSettled([]);

// a duplicate static field is last-wins -> inject the last static's method
class Dup {
  static K = Array;
  static K = Iterator;
}
const {
  K: {
    from
  }
} = Dup;
export const viaDup = from([1, 2]);

// a super-class reached through a namespace member resolves and injects its constructor
const Reg = {
  Base: Map
};
class Sub extends Reg.Base {}
export const sub = new Sub([[1, 2]]);