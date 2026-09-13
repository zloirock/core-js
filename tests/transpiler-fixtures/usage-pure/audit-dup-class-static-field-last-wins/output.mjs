import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
// Duplicate static fields resolve to the last matching declaration, including computed string keys.
// Unknown computed keys require dispatch through the actual stored constructor.
// A later static block keeps its written slot instead of assuming the original field value.
// Single-field and computed-key controls preserve the directly resolved cases.
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

// An unknown computed key may override the field. Test the stored constructor's identity
// before selecting either candidate's static method.
export function dynamicKeyBails(o) {
  class Guard {
    static P = Array;
    static [o.k] = _Iterator;
  }
  const {
      P: _ref
    } = Guard,
    from = _ref === _Iterator ? _Iterator$from : _ref === Array ? _Array$from : _ref.from;
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