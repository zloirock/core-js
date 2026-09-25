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
// a pattern reading a static and an instance member off a value it must evaluate once - a call, a
// getter, a sequence ending in either - memoizes that value AHEAD of both reads: the static binds its
// polyfill, the instance member dispatches on the memo, and no read precedes the memo's declaration
function make() {
  return Map;
}
const {
  groupBy: fromCall,
  name: callName
} = make();
class Holder {
  static get made() {
    return Promise;
  }
}
const {
  try: fromGetter,
  name: getterName
} = Holder.made;
let n = 0;
const {
  from: fromSequence,
  name: sequenceName
} = (n++, make2());
function make2() {
  return Iterator;
}
use(fromCall, callName, fromGetter, getterName, fromSequence, sequenceName, n);