import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
// a static method's `super.X` reads the class's heritage. pure names that static only where the
// heritage is one constructor: over an alias the file may reassign it leaves the read as written,
// so the constructor the alias may hold takes its whole entry. a const alias stays named
class ShimMap {}
let MaybeMap = _Map;
if (_globalThis.needsShim) MaybeMap = ShimMap;
class Grouped extends MaybeMap {
  static group(items) {
    return super.groupBy(items, item => item.kind);
  }
}
export const grouped = Grouped.group([]);
const FixedPromise = _Promise;
class Settled extends FixedPromise {
  static settle(items) {
    return _Promise$allSettled.call(this, items);
  }
}
export const settled = Settled.settle([]);