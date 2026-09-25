import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.function.name";
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
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// a static read off a CONDITIONALLY reassigned name in the MIDDLE of a pattern gets no identity guard
// (the render guards a sole slot or a pattern end only): the census holds the constructor's namespace
// for it instead, in a declaration and an assignment, while a pattern end keeps its guard
let M = Map;
if (n) M = {
  groupBy: 7,
  name: 'x'
};
const {
  a1,
  groupBy: s1,
  name: nm1
} = M;
let P = Promise;
if (n) P = {};
let a2, t2, nm2;
({
  a2,
  try: t2,
  name: nm2
} = P);
let I = Iterator;
if (n) I = {};
const {
  name: nm3,
  from: f3
} = I;
use(a1, s1, nm1, a2, t2, nm2, nm3, f3);