import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.reject";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.promise.race";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.promise.all-keyed";
import "core-js/modules/esnext.promise.all-settled-keyed";
import "core-js/modules/web.dom-collections.iterator";
// In usage-global the branches a walk enumerates off a user selection are the ones the build runs: the
// arm a presence test never takes injects nothing - a destructure, a default, an assignment and the
// realm-detection idiom alike. A test that lets its right run keeps it live and injected.
export const {
  from
} = typeof Promise !== 'undefined' ? Array : Iterator;
export const {
  of: viaFalse
} = typeof Map === 'undefined' ? Set : Array;
export function viaDefault({
  fromAsync: f
} = typeof Promise !== 'undefined' ? Array : WeakMap) {
  return f;
}
let assigned;
({
  hasOwn: assigned
} = typeof Promise !== 'undefined' ? Object : URL);
export const {
  Promise: realm
} = typeof globalThis !== 'undefined' ? globalThis : self;
export const {
  groupBy: live
} = !Promise || Map;
export { assigned };