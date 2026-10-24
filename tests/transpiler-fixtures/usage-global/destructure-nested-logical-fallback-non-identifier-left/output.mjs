import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
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
import "core-js/modules/web.dom-collections.iterator";
// a nested destructure over a `||` / `??` init reaches the proxy on EITHER operand whatever the
// left spells: a member, a call and a nullish test hand the read to the global fallback exactly as
// a bare identifier left does, so the static under the proxy is a polyfill candidate in each
// one static per row, so every row is observable by its own module
const {
  Array: {
    from: viaMember
  }
} = obj.p || globalThis;
export const a = viaMember([1]);
const {
  Array: {
    of: viaNullish
  }
} = obj.p ?? globalThis;
export const b = viaNullish(2);
const {
  Array: {
    fromAsync: viaCall
  }
} = mk() || globalThis;
export const c = viaCall([3]);
// control: the identifier left the recogniser always saw
const {
  Map: {
    groupBy: viaIdentifier
  }
} = m || globalThis;
export const d = viaIdentifier([4], x => x);