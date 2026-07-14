// a super-class alias destructured from a proxy-global MEMBER short-circuits to the key only
// when the member's LEAF is itself a proxy-global (the chain re-enters the global surface);
// any other leaf names an arbitrary member slot - dispatching its key as the pristine global
// substituted the global's static over a vendor value

// vendor leaf: `Reflect.Map` is a member slot, not the global Map - stays native
const { Map: MV } = globalThis.Reflect;
class QV extends MV { static m(items) { return super.groupBy(items, tag); } }
export const viaVendorLeaf = QV.m(list);

// bare proxy-global init keeps the short-circuit
const { Promise: PB } = globalThis;
class QB extends PB { static m(list2) { return super.allSettled(list2); } }
export const viaBareProxy = QB.m(items2);

// a single proxy-global hop re-enters the global surface - the key still resolves
const { Promise: PH } = globalThis.self;
class QH extends PH { static m(ops) { return super.race(ops); } }
export const viaHopLeaf = QH.m(competitors);

// deep hops resolve the same way
const { Object: OD } = globalThis.self.window;
class QD extends OD { static m(src) { return super.groupBy(src, tag2); } }
export const viaDeepHops = QD.m(pairs);
