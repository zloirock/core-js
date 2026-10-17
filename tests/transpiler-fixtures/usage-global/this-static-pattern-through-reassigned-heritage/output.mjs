import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a pattern destructuring `this` in a static method reads through the heritage for each key the
// class defines no own static of, so that static is injected; an own static injects nothing
class ShimMap {}
let MaybeMap = Map;
if (globalThis.needsShim) MaybeMap = ShimMap;
class Grouped extends MaybeMap {
  static group(items) {
    const {
      groupBy
    } = this;
    return groupBy(items, item => item.kind);
  }
}
export const grouped = Grouped.group([]);
class ShimPromise {}
let MaybePromise = Promise;
if (globalThis.needsShim) MaybePromise = ShimPromise;
class Settled extends MaybePromise {
  static allSettled(items) {
    return items;
  }
  static settle(items) {
    const {
      allSettled
    } = this;
    return allSettled(items);
  }
}
export const settled = Settled.settle([]);