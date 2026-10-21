import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
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
} = cleanContainer;
export function unknownReceiverNoStaticInjection(anything) {
  const {
    groupBy: nothingInjected
  } = anything;
  return nothingInjected;
}
const repositioned = [{
  q: 1
}, Array];
const methodName = 'reverse';
repositioned[methodName]();
export const viaRepositionedMember = typeof repositioned[0].of;
export { groupBy, entries, reachingValue, viaCleanContainer };