// instance super.X (not static) — `resolveSuperMember` returns null when `!info.isStatic`,
// so the user-pure-import hint-mapping branch never runs. polyfill skipped by design
import MySet from '@core-js/pure/actual/set';
class C extends MySet {
  extend(other) {
    return super.intersection(other);
  }
}