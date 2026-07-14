import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.race";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// the usage-global twin: a vendor-leaf super class must NOT pull the global's method modules
// (over-substitution's injection shadow), while proxy-hop leaves inject through the key

// vendor leaf: `Reflect.Map` is a member slot, not the global Map - stays native
const {
  Map: MV
} = globalThis.Reflect;
class QV extends MV {
  static m(items) {
    return super.groupBy(items, tag);
  }
}
export const viaVendorLeaf = QV.m(list);

// bare proxy-global init keeps the short-circuit
const {
  Promise: PB
} = globalThis;
class QB extends PB {
  static m(list2) {
    return super.allSettled(list2);
  }
}
export const viaBareProxy = QB.m(items2);

// a single proxy-global hop re-enters the global surface - the key still resolves
const {
  Promise: PH
} = globalThis.self;
class QH extends PH {
  static m(ops) {
    return super.race(ops);
  }
}
export const viaHopLeaf = QH.m(competitors);

// deep hops resolve the same way
const {
  Object: OD
} = globalThis.self.window;
class QD extends OD {
  static m(src) {
    return super.groupBy(src, tag2);
  }
}
export const viaDeepHops = QD.m(pairs);