import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref;
// Try/catch can return Map or Set before the unreachable Array tail. The retained-body proof
// leaves this control flow intact, and every return still guards the read as a candidate - one
// promises no path, so the dead tail rides along. No constructor's namespace is exposed.
const tryFrom = (_ref = (() => {
  try {
    return _Map;
  } catch {
    return _Set;
  }
  return Array;
})(), _ref === Array ? _Array$from([1]) : _ref.from([1]));
const tryIntersect = (() => {
  try {
    return _Map;
  } catch {
    return _Set;
  }
  return Array;
})().prototype.intersection;
export { tryFrom, tryIntersect };