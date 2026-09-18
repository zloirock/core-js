import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// Distinct Map / Set returns do not prove one receiver. Keep the conditional call and
// prototype reads intact; neither namespace escapes, so the constructor entries stay narrow.
const tailFrom = (() => {
  if (cond) return _Map;
  return _Set;
})().from([1]);
const tailIntersect = (() => {
  if (cond) return _Map;
  return _Set;
})().prototype.intersection;
export { tailFrom, tailIntersect };