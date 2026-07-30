import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a container slot write must not SILENCE injection in the global flavor: the binding reassignment
// canon is method-aware - pure bails (a write anywhere may reach the read), global bails only on
// PROVEN dominance, which the slot record cannot establish, so it keeps resolving and over-injects
// the literal's candidate. the written value's own statics inject too (the recorded value joins
// the union axis); here that import coincides with the binding-canon cell's, so this file locks
// the literal candidate surviving - the reaching union has its own fixture
const w = {
  k: Object
};
w.k = Map;
const {
  k: {
    groupBy
  }
} = w;
const b = [Object];
b.reverse();
const {
  0: {
    entries
  }
} = b;
// the binding-reassignment canon injects by REACHING value (`O = Map` kills the Object init), the
// clean container injects its literal's candidate, and a bare unknown receiver injects no static -
// statics never inject by name alone
let O = Object;
O = Map;
const {
  groupBy: reachingValue
} = O;
const cleanContainer = {
  k: Object
};
const {
  k: {
    groupBy: viaCleanContainer
  }
} = cleanContainer;
export function unknownReceiverNoStaticInjection(anything) {
  const {
    groupBy: nothingInjected
  } = anything;
  return nothingInjected;
}
// a repositioned container read through a MEMBER injects every element-candidate (the union axis);
// the const-bound method key is the unreadable-spelling twin of the plain call
const repositioned = [{
  q: 1
}, Array];
const methodName = 'reverse';
repositioned[methodName]();
export const viaRepositionedMember = typeof repositioned[0].of;
export { groupBy, entries, reachingValue, viaCleanContainer };