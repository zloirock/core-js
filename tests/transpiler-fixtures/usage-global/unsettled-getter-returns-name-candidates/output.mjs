import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
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
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// a getter whose body the single-return proof cannot settle (`try`, `switch`, `finally`) still hands
// the injecting flavor the constructors its returns spell, so a static read through it is polyfilled
// wherever it may run
class KE {
  static get I() {
    try {
      log();
    } catch {}
    return Iterator;
  }
  static get S() {
    switch (n) {
      case 0:
        return Promise;
      default:
        return Math;
    }
  }
}
const o = {
  get M() {
    try {
      log();
    } finally {}
    return Map;
  }
};
const {
  M: {
    from: s1
  }
} = {
  M: KE.I
};
const {
  try: s2
} = KE.S;
use(s1, s2, o.M.groupBy);