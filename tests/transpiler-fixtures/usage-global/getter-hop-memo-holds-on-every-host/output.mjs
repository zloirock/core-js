import "core-js/modules/es.object.to-string";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
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
import "core-js/modules/es.iterator.zip";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// a getter hop read by a static and an instance member (`{ M: KE.I }`) is memoized once, ahead of the
// static, on every host - a sibling declarator, a bodyless slot, a sequence init, beside a second hop,
// an export, with the instance member written first - and a prefixed sole instance leaf or a
// multi-leaf assignment carries its prefix into the one read it performs
class KE {
  static get I() {
    log();
    return Iterator;
  }
  static get P() {
    log();
    return Promise;
  }
}
function g() {
  log();
  return [1, [2]];
}
const z1 = log(),
  {
    M: {
      from: s1,
      name: nm1
    }
  } = {
    M: KE.I
  };
if (c) var {
  M: {
    try: s2,
    name: nm2
  }
} = {
  M: KE.P
};
const {
  M: {
    concat: s3,
    name: nm3
  }
} = (n++, {
  M: KE.I
});
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
export const {
  M: {
    withResolvers: s5,
    name: nm5
  }
} = (n++, {
  M: KE.P
});
const {
  M: {
    name: nm8,
    allSettled: s8
  }
} = {
  M: KE.P
};
let {
  M: {
    name: nm9,
    any: s9
  }
} = {
  M: KE.P
};
const {
  m: {
    at: s6
  }
} = (n++, h);
let s7, f7;
({
  M: {
    findLast: s7,
    flat: f7
  }
} = (n++, {
  M: g()
}));
use(z1, s1, nm1, s2, nm2, s3, nm3, a4, s4, nm4, s6, s7, f7, nm8, s8, nm9, s9);