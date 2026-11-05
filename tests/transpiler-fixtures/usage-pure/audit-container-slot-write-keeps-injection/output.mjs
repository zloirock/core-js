import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// Writes and repositioning preserve the actual runtime slot of a container.
// Pure keeps native container statics and full replacement constructors; direct reaching-value statics still resolve.
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
// A direct reaching-value static is served; literal-container and unknown-receiver reads remain native.
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
// A repositioned container member keeps the actual runtime slot; its bound call key does not hide the mutation.
const repositioned = [{
  q: 1
}, Array];
const methodName = 'reverse';
repositioned[methodName]();
export const viaRepositionedMember = typeof repositioned[0].of;
export { groupBy, entries, reachingValue, viaCleanContainer };