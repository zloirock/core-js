import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.to-reversed";
import "core-js/modules/es.array.to-sorted";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.array.with";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.concat";
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
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// a user GETTER typed to a constructor (`KE.A`, `OE.A`) under a nested instance claim beside a
// sibling is read ONCE: one capture serves the nested claim and the sibling alike - beside a static,
// a residual, two nested claims, exported, beside a sibling declarator, in an assignment and with the
// static written first; `Array` itself needs none
class KE {
  static get A() {
    log();
    return Array;
  }
  static get I() {
    log();
    return Iterator;
  }
  static get P() {
    log();
    return Promise;
  }
}
const OE = {
  get A() {
    log();
    return Array;
  }
};
const {
  prototype: {
    at: m1
  },
  from: a1
} = KE.A;
const {
  prototype: {
    flat: m2
  },
  foo: r2
} = KE.A;
const {
  prototype: {
    with: m3,
    toSorted: f3
  },
  bar: a3
} = KE.A;
const {
  prototype: {
    findLast: m4
  },
  fromAsync: a4
} = OE.A;
export const {
  prototype: {
    drop: m5
  },
  concat: a5
} = KE.I;
const z6 = 1,
  {
    prototype: {
      take: m6
    },
    from: a6
  } = KE.I;
const {
  prototype: {
    flatMap: m7
  },
  isArray: a7
} = Array;
let m8, a8;
({
  prototype: {
    toReversed: m8
  },
  of: a8
} = KE.A);
const {
  try: a9,
  prototype: {
    finally: m9
  }
} = KE.P;
use(m1, a1, m2, r2, m3, f3, a3, m4, a4, z6, m6, a6, m7, a7, m8, a8, a9, m9);