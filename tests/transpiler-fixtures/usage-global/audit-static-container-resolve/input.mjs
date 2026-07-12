// usage-global resolves a static container the same canonical way pure does, then injects the
// resolved global's polyfill: a computed static-string key overrides (last-wins), a duplicate field
// is last-wins, and a super-class reached through a namespace member resolves its constructor

// a computed static-string key overrides the earlier plain field -> inject the LAST static's method
class Computed {
  static M = Array;
  static ["M"] = Promise;
}
const { M: { allSettled } } = Computed;
export const viaComputed = allSettled([]);

// a duplicate static field is last-wins -> inject the last static's method
class Dup {
  static K = Array;
  static K = Iterator;
}
const { K: { from } } = Dup;
export const viaDup = from([1, 2]);

// a super-class reached through a namespace member resolves and injects its constructor
const Reg = { Base: Map };
class Sub extends Reg.Base {}
export const sub = new Sub([[1, 2]]);
