import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.error.cause";
import "core-js/modules/es.error.is-error";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
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
import "core-js/modules/es.math.sum-precise";
import "core-js/modules/es.number.constructor";
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
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// a class EXPRESSION's inner name (`K1` in `const C1 = class K1 {}`) is bound inside its own body: a
// static read through it takes its polyfill in a static block, a method, a field, a destructure, an
// arrow, parenthesized or as an argument, under any outer binding kind; a write through it keeps the
// read native, and so does a computed key, which evaluates in the inner name's TDZ
const C1 = class K1 {
  static M = Map;
  static {
    use(K1.M.groupBy);
  }
};
const C2 = class K2 {
  static O = Object;
  static f() {
    return K2.O.groupBy;
  }
};
const C3 = class K3 {
  static P = Promise;
  static t = K3.P.try;
};
const C4 = class K4 {
  static I = Iterator;
  static {
    const {
      from: f4
    } = K4.I;
    use(f4);
  }
};
const C5 = (0, class K5 {
  static A = Array;
  static f() {
    return K5.A.fromAsync;
  }
});
const C6 = class K6 {
  static E = Error;
  static {
    use(K6.E.isError);
  }
};
let C7 = class K7 {
  static P = Promise;
  static f() {
    return K7.P.withResolvers;
  }
};
var C8 = class K8 {
  static M = Math;
  static {
    const g = () => K8.M.sumPrecise;
    use(g);
  }
};
let C9;
C9 = class K9 {
  static O = Object;
  static f() {
    return K9.O.fromEntries;
  }
};
const C10 = class K10 {
  static N = Number;
  static {
    K10.N = Set;
    use(K10.N.isInteger);
  }
};
const C11 = class K11 {
  static A = Array;
  [K11.A.of]() {}
};