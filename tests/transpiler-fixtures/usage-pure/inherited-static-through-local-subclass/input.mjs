// Inherited statics resolve through local class chains and aliases of the subclass.
// Calls preserve the subclass receiver; a local own static still wins.
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
