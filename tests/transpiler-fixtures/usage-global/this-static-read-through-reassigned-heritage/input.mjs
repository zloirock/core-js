// `this.X` in a static method reads through the heritage where the class defines no own static X,
// so that static is injected; an own static answers the read itself and injects nothing
class ShimMap {}
let MaybeMap = Map;
if (globalThis.needsShim) MaybeMap = ShimMap;
class Grouped extends MaybeMap {
  static group(items) {
    return this.groupBy(items, item => item.kind);
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
    return this.allSettled(items);
  }
}
export const settled = Settled.settle([]);
