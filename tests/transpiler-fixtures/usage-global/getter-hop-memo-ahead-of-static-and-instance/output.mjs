import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
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
import "core-js/modules/es.iterator.zip-keyed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// a nested level read through a user GETTER (`{ M: KE.I }`) by a static and an instance member
// memoizes the getter's value once, AHEAD of the static's binding - the getter runs before the
// pattern binds anything - as a `const` whatever the host's kind, and the replay of the flattened
// level does not read the getter a second time
class KE {
  static get I() {
    log();
    return Iterator;
  }
  static get A() {
    log();
    return Array;
  }
}
const {
  M: {
    from: fromConst,
    name: constName
  }
} = {
  M: KE.I
};
let {
  M: {
    concat: concatLet,
    name: letName
  }
} = {
  M: KE.I
};
var {
  M: {
    zip: zipVar,
    name: varName
  }
} = {
  M: KE.I
};
export const {
  M: {
    zipKeyed: zipKeyedExport,
    name: exportName
  }
} = {
  M: KE.I
};
const run = () => {
  const {
    M: {
      of: ofArrow,
      name: arrowName
    }
  } = {
    M: KE.A
  };
  return [ofArrow, arrowName];
};
use(fromConst, constName, concatLet, letName, varName, zipVar, run);