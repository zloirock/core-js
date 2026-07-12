// duplicate static class fields are LAST-wins at runtime (`NS.M === Iterator`), so a destructure
// off the static must resolve through the LAST declaration - substituting the first is wrong-value
class NS {
  static M = Array;
  static M = Iterator;
}
const { M: { from } } = NS;
export const viaDup = from([1, 2]);

// a single static field resolves normally (control)
class Single {
  static K = Map;
}
const { K: { groupBy } } = Single;
export const viaSingle = groupBy([], x => x);

// a COMPUTED static-string key (`static ["N"]`) overrides an earlier plain field just like a plain
// one does at runtime, so the LAST-wins resolution must see through the computed key too
class Computed {
  static N = Array;
  static ["N"] = Promise;
}
const { N: { allSettled } } = Computed;
export const viaComputedOverride = allSettled([]);

// an UNRESOLVABLE computed static key could BE the target name at runtime and override the plain
// field, so resolution must BAIL (native) rather than fold the stale plain value
export function dynamicKeyBails(o) {
  class Guard {
    static P = Array;
    static [o.k] = Iterator;
  }
  const { P: { from } } = Guard;
  return from([1, 2]);
}

// a static block at a LATER position may reassign the field via `NS.field = ...`, so the field's
// value is unknowable -> bail (the class analog of a trailing object spread)
class WithBlock {
  static T = Map;
  static {
    WithBlock.T = Array;
  }
}
const { T: { groupBy: viaBlock } } = WithBlock;
export const viaStaticBlock = viaBlock([], x => x);
