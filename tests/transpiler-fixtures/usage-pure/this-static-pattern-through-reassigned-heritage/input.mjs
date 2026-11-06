// a pattern destructuring `this` in a static method reads the class, and through it the heritage
// for each key the class defines no own static of: over an alias the file may reassign, pure leaves
// the read as written and the constructor the alias may hold takes its whole entry
class ShimMap {}
let MaybeMap = Map;
if (globalThis.needsShim) MaybeMap = ShimMap;
class Grouped extends MaybeMap {
  static group(items) {
    const { groupBy } = this;
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
    const { allSettled } = this;
    return allSettled(items);
  }
}
export const settled = Settled.settle([]);
