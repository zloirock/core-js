import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// IIFE body declares its own bindings (`const`, `function`, `class`) - those bindings
// shadow free identifiers at body scope, but the caller resolves the inlined return at
// the CALLER's scope. without bailing on body declarations, `(() => { const Map = X;
// return Map; })()` would mis-resolve as global Map and emit Map.groupBy polyfill for a
// receiver that is in fact `WeakMap`. fix: any local VariableDeclaration / FunctionDeclaration
// / ClassDeclaration in the body must bail the inline so the receiver stays opaque
'groupBy' in (() => {
  const Map = _WeakMap;
  return Map;
})();
'from' in (() => {
  function Array() {
    return [];
  }
  return Array;
})();
'create' in (() => {
  class Object {}
  return Object;
})();