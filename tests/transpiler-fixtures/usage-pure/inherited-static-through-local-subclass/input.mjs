// pure names no static a local class only inherits: the read stays on the class - through `super`
// over a local base class or through an alias of the subclass - so the constructor at the end of
// the heritage takes its whole entry. a static the local class defines itself answers the read
class GroupedBase extends Map {}
class Grouped extends GroupedBase {
  static group(items) {
    return super.groupBy(items, item => item.kind);
  }
}
export const grouped = Grouped.group([]);

class SettledBase extends Promise {}
const Settled = SettledBase;
export const settled = Settled.allSettled([]);

class OwnFrom extends Iterator {
  static from(source) {
    return source;
  }
}
const Own = OwnFrom;
export const own = Own.from([]);
