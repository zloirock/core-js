import _Map from "@core-js/pure/actual/map/constructor";
// optional-call IIFE with FunctionExpression - inlineCallReturnExpression accepts both
// CallExpression and OptionalCallExpression. lock that `(function(){return Map;})?.().has(1)`
// resolves receiver to Map and rewrites the prototype-method call accordingly.
// also probe FunctionExpression (not just ArrowFunctionExpression) - the gate accepts both
const out = (_Map.has)(1);
export { out };