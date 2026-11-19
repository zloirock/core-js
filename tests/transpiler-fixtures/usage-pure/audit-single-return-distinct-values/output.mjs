import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref;
// Distinct returned constructors cannot prove one receiver. Preserve the call and guard
// a possible static by its actual identity; prototype reads keep their native lookup.
const arrFrom = (_ref = (() => {
  return Array;
  return _Set;
})(), _ref === Array ? _Array$from([1]) : _ref.from([1]));
const setIntersect = (() => {
  return _Set;
  return Array;
})().prototype.intersection;
export { arrFrom, setIntersect };