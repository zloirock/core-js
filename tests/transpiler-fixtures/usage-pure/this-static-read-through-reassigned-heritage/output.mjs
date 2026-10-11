import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise/constructor";
// `this.X` in a static method reads the class, and through it the heritage where the class defines
// no own static X: over an alias the file may reassign, pure leaves the read as written and the
// constructor the alias may hold takes its whole entry. an own static answers the read itself
class ShimMap {}
let MaybeMap = _Map;
if (_globalThis.needsShim) MaybeMap = ShimMap;
class Grouped extends MaybeMap {
  static group(items) {
    return this.groupBy(items, item => item.kind);
  }
}
export const grouped = Grouped.group([]);
class ShimPromise {}
let MaybePromise = _Promise;
if (_globalThis.needsShim) MaybePromise = ShimPromise;
class Settled extends MaybePromise {
  static allSettled(items) {
    return items;
  }
  static settle(items) {
    return this.allSettled(items);
  }
}
export const settled = Settled.settle([]);