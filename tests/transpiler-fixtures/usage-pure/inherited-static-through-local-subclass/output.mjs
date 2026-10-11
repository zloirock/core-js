import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
// pure names no static a local class only inherits: the read stays on the class - through `super`
// over a local base class or through an alias of the subclass - so the constructor at the end of
// the heritage takes its whole entry. a static the local class defines itself answers the read
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