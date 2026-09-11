import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
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
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// the usage-global union follows the INIT-alias hop even when the alias itself is
// reassigned: the no-own-write runtime path (`d` false) still holds the init source's
// reachable values, so M0's `c`-true target must inject alongside M's own reassignment
function f(c, d) {
  let M0 = Object;
  if (c) M0 = Array;
  let M = M0;
  if (d) M = Map;
  M.from([1, 2, 3]);
}
f(true, false);

// a mutually-aliased pair terminates via the seen-guard and still reaches the reassignment
// target through the live leg
let A = B;
let B = A;
if (x) A = Iterator;
A.from([1]);

// a TWO-hop alias chain reaches the source's reachable values through both hops
function g(c, d) {
  let N0 = Object;
  if (c) N0 = Array;
  let N1 = N0;
  let N2 = N1;
  if (d) N2 = Map;
  N2.of(1);
}
g(true, false);