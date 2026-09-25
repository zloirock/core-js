import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
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
// a residual whose init RUNS code - a call, a getter, an effect inside the read - evaluates it
// before the pattern binds anything: every extraction follows that residual, which keeps its own
// prefix - on a sole or sibling declarator, in a loop head, behind an assignment, when exported
function load() {
  log();
  return globalThis;
}
class Src {
  static get realm() {
    log();
    return globalThis;
  }
}
var {
  from: f1,
  other: o1
} = load().Array;
var a = 1,
  {
    groupBy: g2,
    other: o2
  } = Src.realm.Map;
for (var i = 0, {
    of: f3,
    other: o3
  } = (log(), globalThis).Array; i < 1; i++);
for (var j = 0, {
    fromAsync: f8,
    other: o8
  } = (log(), load().Array); j < 1; j++);
for (var {
  fromEntries: f4,
  other: o4
} = load().Object; !f4;) break;
var f5, t5, o5;
({
  allSettled: f5,
  try: t5,
  other: o5
} = (log(), load().Promise));
export var {
  hasOwn: f6,
  other: o6
} = Src.realm.Object;
var {
  concat: f7,
  other: o7
} = load().Iterator;