import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an emptied pattern over an init that RUNS code keeps what runs, ahead of the binding it fed:
// a getter read replays whole, a realm call keeps the call and any effect before it - a prefix
// of the init or of the read's own root - and several lifted effects run as one statement
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
let n = 0;
let w;
var {
  groupBy: g1
} = Src.realm.Map;
var {
  of: f2
} = (log(), load().Array);
var {
  fromEntries: f3
} = (log(), load()).Object;
if (log) var {
  allSettled: f4
} = (n++, w = Src.realm.Promise);