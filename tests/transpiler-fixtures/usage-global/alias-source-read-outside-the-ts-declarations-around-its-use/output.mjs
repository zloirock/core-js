import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.chunks";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.iterator.join";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.iterator.windows";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an alias reads its source where it is declared, so a namespace or an enum declared around the use - in
// the namespace or the function the use stands in - does not shadow that read, however it is named: the
// alias, and a container literal holding the name, still hold the global
const A = Array;
const B = A;
namespace N {
  namespace A {
    export const x = 1;
  }
  use(B.from(xs));
}
const P = Promise;
export function settled() {
  enum Promise {
    resolve = 1
  }
  return P.resolve(1);
}
const s = (c ? globalThis : other).Array;
const t = s;
namespace M {
  namespace s {
    export const x = 1;
  }
  use(t.of(1));
}
const wrapper = {
  a: Iterator
};
namespace W {
  namespace Iterator {
    export const x = 1;
  }
  use(wrapper.a.from(xs));
}