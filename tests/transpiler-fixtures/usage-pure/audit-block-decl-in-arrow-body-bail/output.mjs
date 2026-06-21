import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// arrow IIFE with a VariableDeclaration / FunctionDeclaration / ClassDeclaration in the body:
// return-expression inlining bails because such a local binding would shadow free identifiers
// in the return at body scope. the caller resolves the return at CALLER scope, so a body
// `const Map = WeakMap; return Map` must not mis-resolve as the global Map.
const a = (() => {
  const Map = _WeakMap;
  return Map;
})().has(1);
const b = (() => {
  function Set() {
    return null;
  }
  return Set;
})().intersection(new _Set([1]));
const c = (() => {
  class Promise {}
  return Promise;
})().try(() => 1);
export { a, b, c };