// a static method's `super.X` reads the class's heritage. pure names that static only where the
// heritage is one constructor: over an alias the file may reassign it leaves the read as written,
// so the constructor the alias may hold takes its whole entry. a const alias stays named
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
