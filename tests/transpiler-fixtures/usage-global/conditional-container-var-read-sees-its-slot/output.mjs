import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.concat";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
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
// a read off a container `var` initialized in a BRANCH may see the container wherever the init can
// have run by the read - directly, loop-carried and through a closure; where the init sits in the
// opposite arm, or is declared after the read, the read can never see it. pure keeps the read behind
// an identity guard on the constructor the slot holds, so a skipped branch still throws natively
function g1() {
  if (on) {
    var box = {
      A: Array
    };
  }
  return box.A.from;
}
function g2() {
  let r;
  for (let i = 0; i < 2; i++) {
    if (i) r = box.P.try;else {
      var box = {
        P: Promise
      };
    }
  }
  return r;
}
function g3() {
  if (on) {
    var box = {
      I: Iterator
    };
  }
  return () => box.I.concat;
}
function g4() {
  if (!on) {
    var box = {
      O: Object
    };
  } else {
    return box.O.fromEntries;
  }
}
function g5() {
  const r = box.M.sumPrecise;
  var box = {
    M: Math
  };
  return r;
}
use(g1, g2, g3, g4, g5);