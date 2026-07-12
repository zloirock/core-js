import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
// duplicate static class fields are LAST-wins at runtime (`NS.M === Iterator`), so a destructure
// off the static must resolve through the LAST declaration - substituting the first is wrong-value
class NS {
  static M = Array;
  static M = _Iterator;
}
const from = _Iterator$from;
export const viaDup = from([1, 2]);

// a single static field resolves normally (control)
class Single {
  static K = _Map;
}
const groupBy = _Map$groupBy;
export const viaSingle = groupBy([], x => x);

// a COMPUTED static-string key (`static ["N"]`) overrides an earlier plain field just like a plain
// one does at runtime, so the LAST-wins resolution must see through the computed key too
class Computed {
  static N = Array;
  static ["N"] = _Promise;
}
const allSettled = _Promise$allSettled;
export const viaComputedOverride = allSettled([]);

// an UNRESOLVABLE computed static key could BE the target name at runtime and override the plain
// field, so resolution must BAIL (native) rather than fold the stale plain value
export function dynamicKeyBails(o) {
  class Guard {
    static P = Array;
    static [o.k] = _Iterator;
  }
  const {
    P: {
      from
    }
  } = Guard;
  return from([1, 2]);
}

// a static block at a LATER position may reassign the field via `NS.field = ...`, so the field's
// value is unknowable -> bail (the class analog of a trailing object spread)
class WithBlock {
  static T = _Map;
  static {
    WithBlock.T = Array;
  }
}
const {
  T: {
    groupBy: viaBlock
  }
} = WithBlock;
export const viaStaticBlock = viaBlock([], x => x);