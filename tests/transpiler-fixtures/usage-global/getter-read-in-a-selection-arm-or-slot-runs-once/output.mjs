import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
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
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// a getter read (`K.g`) in a sequence prefix of a realm SELECTION arm, or in a literal SLOT the
// destructure discards, is work the source does: it runs once where the source ran it, and a read
// the claim's own dispatch performs (a carried slot, an element) is not replayed beside it
class K {
  static get g() {
    log();
    return 0;
  }
}
const nb = {
  get y() {
    log();
    return [1, 2];
  },
  get z() {
    log();
    return 1;
  }
};
const {
  Array: {
    from: a1
  }
} = (K.g, globalThis) ?? {};
const {
  Iterator: {
    from: a2
  }
} = (K.g, globalThis) || {};
const {
  Promise: {
    try: a3
  }
} = c ? (K.g, globalThis) : {};
const {
  y: {
    at: v4
  }
} = {
  y: nb.y,
  z: nb.z
};
const [{
  y: {
    flat: v5
  }
}] = [{
  y: nb.y
}];
const [{
  [Symbol.iterator]: it6
}] = [nb.y];
use(a1, a2, a3, v4, v5, it6);