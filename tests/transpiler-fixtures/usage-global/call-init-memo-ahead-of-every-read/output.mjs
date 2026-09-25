import "core-js/modules/es.object.from-entries";
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
// a pattern reading a static and an instance member off a CALL memoizes the call once, and the memo
// stands ahead of every read of it: behind a sibling declarator whose init runs first, and in a loop
// head - the one host without a statement slot, where a lone instance reader still takes the memo
// rather than spelling the call a second time
function mkIterator() {
  log();
  return Iterator;
}
function mkMap() {
  log();
  return Map;
}
function mkObject() {
  log();
  return Object;
}
function mkPromise() {
  log();
  return Promise;
}
const z = 1,
  {
    from: fromIterator,
    name: iteratorName
  } = mkIterator();
for (const {
  groupBy: fromMap,
  name: mapName
} = mkMap();;) break;
for (let {
    fromEntries: fromObject,
    name: objectName
  } = mkObject(), i = 0; i < 1; i++) use(fromObject, objectName);
for (var {
  try: fromPromise,
  name: promiseName
} = mkPromise();;) break;
use(z, fromIterator, iteratorName, fromPromise, promiseName);