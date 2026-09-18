import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// Try/catch can return Map or Set before the unreachable Array tail. The retained-body proof
// leaves this control flow intact. Local returns do not expose either constructor's namespace.
const tryFrom = (() => {
  try {
    return _Map;
  } catch {
    return _Set;
  }
  return Array;
})().from([1]);
const tryIntersect = (() => {
  try {
    return _Map;
  } catch {
    return _Set;
  }
  return Array;
})().prototype.intersection;
export { tryFrom, tryIntersect };