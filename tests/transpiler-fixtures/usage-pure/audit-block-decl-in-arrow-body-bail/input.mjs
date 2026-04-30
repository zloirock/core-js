// arrow IIFE with VariableDeclaration / FunctionDeclaration / ClassDeclaration in body:
// `singleReturnBodyExpression` bails because LOCAL_BINDING_DECL_TYPES would shadow free
// identifiers in the return at body scope. caller resolves the return at CALLER's scope,
// so a body `const Map = WeakMap; return Map` would mis-resolve as global Map.
const a = (() => {
  const Map = WeakMap;
  return Map;
})().has(1);
const b = (() => {
  function Set() {
    return null;
  }
  return Set;
})().intersection(new Set([1]));
const c = (() => {
  class Promise {}
  return Promise;
})().try(() => 1);
export { a, b, c };
