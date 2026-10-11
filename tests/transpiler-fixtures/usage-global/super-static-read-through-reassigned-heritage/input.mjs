// a static method's `super.X` reads the class's heritage: the static is injected for the constructor
// the heritage alias may hold, whether the file may reassign the alias or it is a const one
class ShimMap {}
let MaybeMap = Map;
if (globalThis.needsShim) MaybeMap = ShimMap;
class Grouped extends MaybeMap {
  static group(items) {
    return super.groupBy(items, item => item.kind);
  }
}
export const grouped = Grouped.group([]);

const FixedPromise = Promise;
class Settled extends FixedPromise {
  static settle(items) {
    return super.allSettled(items);
  }
}
export const settled = Settled.settle([]);
