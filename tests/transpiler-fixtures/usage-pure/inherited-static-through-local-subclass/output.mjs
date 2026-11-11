import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
// Inherited statics resolve through local class chains and aliases of the subclass.
// Calls preserve the subclass receiver; a local own static still wins.
class GroupedBase extends _Map {}
class Grouped extends GroupedBase {
  static group(items) {
    return super.groupBy(items, item => item.kind);
  }
}
export const grouped = Grouped.group([]);
class SettledBase extends _Promise {}
const Settled = SettledBase;
export const settled = Settled.allSettled([]);
class OwnFrom extends _Iterator {
  static from(source) {
    return source;
  }
}
const Own = OwnFrom;
export const own = Own.from([]);