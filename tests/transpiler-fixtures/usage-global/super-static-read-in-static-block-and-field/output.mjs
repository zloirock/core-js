import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a static block and a static field initializer read `super` off the class's heritage as a static
// method does, so the static is injected for the constructor the heritage alias may hold
class ShimMap {}
let MaybeMap = Map;
if (globalThis.needsShim) MaybeMap = ShimMap;
export let grouped;
class InBlock extends MaybeMap {
  static {
    grouped = super.groupBy([1, 2], item => item % 2);
  }
}
class ShimPromise {}
let MaybePromise = Promise;
if (globalThis.needsShim) MaybePromise = ShimPromise;
class InField extends MaybePromise {
  static settled = super.allSettled([]);
}
export const {
  settled
} = InField;