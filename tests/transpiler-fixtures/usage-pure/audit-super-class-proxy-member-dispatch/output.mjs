import _globalThis from "@core-js/pure/actual/global-this";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
// a super-class alias destructured from a proxy-global MEMBER short-circuits to the key only
// when the member's LEAF is itself a proxy-global (the chain re-enters the global surface);
// any other leaf names an arbitrary member slot - dispatching its key as the pristine global
// substituted the global's static over a vendor value

// vendor leaf: `Reflect.Map` is a member slot, not the global Map - stays native
const {
  Map: MV
} = _Reflect;
class QV extends MV {
  static m(items) {
    return super.groupBy(items, tag);
  }
}
export const viaVendorLeaf = QV.m(list);

// bare proxy-global init keeps the short-circuit
const PB = _Promise;
class QB extends PB {
  static m(list2) {
    return _Promise$allSettled.call(this, list2);
  }
}
export const viaBareProxy = QB.m(items2);

// a single proxy-global hop re-enters the global surface - the key still resolves
const PH = _Promise;
class QH extends PH {
  static m(ops) {
    return _Promise$race.call(this, ops);
  }
}
export const viaHopLeaf = QH.m(competitors);

// deep hops resolve the same way
const {
  Object: OD
} = _globalThis;
class QD extends OD {
  static m(src) {
    return _Object$groupBy.call(this, src, tag2);
  }
}
export const viaDeepHops = QD.m(pairs);