import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref, _ref2;
// Unrelated var / let / const declarations stay inside the call and permit resolving its return.
// Function and class declarations remain outside the admitted body grammar.
const a = (() => {
  var local = 1;
  return _Map;
})().from([1]);
const b = (() => {
  let local = 1;
  return _Set;
})().of(2);
const c = (() => {
  const local = 1;
  return _Map;
})().of(3);
const d = (() => {
  function local() {}
  return _Set;
})().of(4);
const e = (() => {
  class Local {}
  return _Map;
})().of(5);
export { a, b, c, d, e };
export const kinds = [((() => {
  var local = 1;
  return Array;
})(), _Array$from)([1]), ((() => {
  let local = 1;
  return Array;
})(), _Array$from)([2]), ((() => {
  const local = 1;
  return Array;
})(), _Array$from)([3]), (_ref = (() => {
  function local() {}
  return Array;
})(), _ref === Array ? _Array$from([4]) : _ref.from([4])), (_ref2 = (() => {
  class Local {}
  return Array;
})(), _ref2 === Array ? _Array$from([5]) : _ref2.from([5]))];