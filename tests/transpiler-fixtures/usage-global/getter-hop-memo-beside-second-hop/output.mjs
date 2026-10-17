import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.function.name";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.chunks";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.iterator.join";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.iterator.windows";
import "core-js/modules/es.iterator.zip";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A getter hop read by a static and an instance member is memoized once, ahead of the static,
// beside a second hop.
class KE {
  static get I() {
    log();
    return Iterator;
  }
}
const {
  A: {
    from: a4
  },
  M: {
    zip: s4,
    name: nm4
  }
} = {
  A: Array,
  M: KE.I
};
use(a4, s4, nm4);