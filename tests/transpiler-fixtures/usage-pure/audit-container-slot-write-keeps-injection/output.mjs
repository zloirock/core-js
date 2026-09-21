import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// Global injection follows the possible values of written and repositioned container slots.
// A local slot change alone does not require every static method of its constructors.
// Pure keeps the written slot native and retains the replacement constructor's statics.
// The unconditional write makes the initial Object unreachable; it needs no identity guard.
const w = {
  k: Object
};
w.k = _Map;
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
O = _Map;
const reachingValue = _Map$groupBy;
const cleanContainer = {
  k: Object
};
const {
  k: {
    groupBy: viaCleanContainer
  }
} = {
  k: {
    groupBy: _Object$groupBy
  }
};
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