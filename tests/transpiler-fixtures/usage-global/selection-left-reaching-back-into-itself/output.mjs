import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A `||` / `??` whose left reaches back into the selection it is the left of - a call returning the binding
// that selection initializes - decides nothing: the slot is not written yet when its initializer runs, so
// the right runs and keeps its modules, bare or read off the realm alike.
function getMap() {
  return byBare;
}
var byBare = getMap() || Map;
export const grouped = byBare.groupBy(list, key);
function getPromise() {
  return byRealm;
}
var byRealm = getPromise() ?? globalThis.Promise;
export const tried = byRealm.try(task);