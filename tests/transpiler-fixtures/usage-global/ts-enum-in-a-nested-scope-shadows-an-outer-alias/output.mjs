import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
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
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a TS enum declared in a block, a function body, a class static block, a switch case or a loop body
// shadows an outer alias of a constructor there: a read in that scope reads the enum, while the alias read
// outside it keeps the constructor's static. the alias declarations load their constructors' families and
// the loop the iteration modules; distinct static per line
const M = Map;
const P = Promise;
const O = Object;
const I = Iterator;
const A = Array;
{
  enum M {
    groupBy = 1
  }
  use(M.groupBy);
}
function f() {
  enum P {
    allSettled = 1
  }
  return P.allSettled;
}
class K {
  static {
    enum O {
      groupBy = 1
    }
    use(O.groupBy);
  }
}
switch (k) {
  case 1:
    enum I {
      from = 1
    }
    use(I.from);
}
for (const x of xs) {
  enum A {
    of = 1
  }
  use(A.of);
}
use(f(), P.try(g));