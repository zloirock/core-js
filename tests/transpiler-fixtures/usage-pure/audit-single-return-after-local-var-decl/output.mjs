import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
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