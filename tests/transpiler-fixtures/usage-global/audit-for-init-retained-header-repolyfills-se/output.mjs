import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.async-iterator";
import "core-js/modules/es.symbol.for";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-start";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.push";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// usage-global guard for the retained `for` header: this method only ADDS imports and never
// rewrites the header, so the whole matrix must stay import-only however the pure receiver
// collapse, its re-emitted effects and their memo placement are resolved
const log = [];
const obj = {
  text: 'ab'
};
const arr = [3, 1, 2];
let k;
function gf() {
  return globalThis;
}
for (const {
  groupBy: g
} = globalThis[log.push('k'), 'Map']; false;) break;
for (const {
  any: a
} = (arr.at(0), globalThis).Promise; false;) break;
for (const {
  ownKeys: o
} = gf()[arr.flat(), 'Reflect']; false;) break;
for (const {
  for: s
} = (k = globalThis)[arr.includes(1), 'Symbol']; false;) break;
for (const {
  values: v
} = globalThis[arr.findLast(Boolean), 'Object']; false;) break;
for (const {
  asyncIterator: i
} = globalThis[obj.text.padStart(4, '.'), 'Symbol']; false;) break;
export { log, k };