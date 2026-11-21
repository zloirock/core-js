import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.to-well-formed";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.url.constructor";
import "core-js/modules/web.url.can-parse";
import "core-js/modules/web.url-search-params.constructor";
// A call may return its default constructor or select it in the body.
// An ensuing static read needs the method on the resulting constructor.
function withDefault(M = Map) {
  return M;
}
function withArm(P) {
  return P || Promise;
}
function url(U = URL) {
  return U;
}
const list = [withDefault()];
export const grouped = list[0].groupBy([1], x => x);
export const attempted = {
  P: withArm()
}.P.try(() => 1);
export const parses = typeof [url()][0].canParse;