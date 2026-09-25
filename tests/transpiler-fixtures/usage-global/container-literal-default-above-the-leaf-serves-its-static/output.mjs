import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.from-entries";
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
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.concat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.species";
import "core-js/modules/es.function.name";
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
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.math.sum-precise";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// a CONTAINER-literal default ABOVE the leaf's level (`= { B: Map }`, `= [Object]`) holds the value
// the static is read through where the default fires: the read takes its polyfill off the literal's
// slot at any depth, beside a sibling, in a declaration, an assignment, a parameter, a loop head and a
// catch clause, and a named container default is read whole, its own declaration left as written
function h1(o) {
  const {
    A: {
      B: {
        groupBy: s
      }
    } = {
      B: Map
    }
  } = o;
  return s;
}
const {
  A: {
    B: {
      try: t2
    }
  } = {
    B: Promise
  }
} = {};
function h3(o) {
  const {
    A: {
      B: {
        C: {
          from: f
        }
      }
    } = {
      B: {
        C: Iterator
      }
    }
  } = o;
  return f;
}
function h4(o) {
  const {
    A: [{
      fromEntries: e
    }] = [Object]
  } = o;
  return e;
}
function h5(o) {
  const {
    A: {
      B: {
        withResolvers: w,
        name: nm
      }
    } = {
      B: Promise
    }
  } = o;
  return [w, nm];
}
function h6(o) {
  let c;
  ({
    A: {
      B: {
        concat: c
      }
    } = {
      B: Iterator
    }
  } = o);
  return c;
}
function h7({
  A: {
    B: {
      fromAsync: a
    }
  } = {
    B: Array
  }
} = {}) {
  return a;
}
function h8(o) {
  const {
    A: {
      B: {
        at
      }
    } = {
      B: [1, 2]
    }
  } = o;
  return at;
}
for (const {
  A: {
    B: {
      sumPrecise: sp
    }
  } = {
    B: Math
  }
} of [{}]) use(sp);
try {
  throw {};
} catch ({
  A: {
    B: {
      isError: ie
    }
  } = {
    B: Error
  }
}) {
  use(ie);
}
const G = [Array];
function h11(o) {
  const {
    A: [{
      of: so
    }] = G
  } = o;
  return so;
}
use(h1, t2, h3, h4, h5, h6, h7, h8, h11);