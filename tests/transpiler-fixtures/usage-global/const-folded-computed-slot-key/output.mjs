import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a computed key a const binding folds names the slot it reads, the way the spelled key does: global
// injects the static the slot's constructor carries, pure keeps that constructor's namespace and
// reads the static raw off it
const o = {
  g: Map,
  p: Promise
};
const k = 'g';
const key = `p`;
export const grouped = o[k].groupBy([1], x => x);
export const attempted = o[key].try(() => 1);