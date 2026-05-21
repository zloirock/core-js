import _Map from "@core-js/pure/actual/map/constructor";
// FunctionExpression IIFE returning proxy-global - `resolveInlineCalleeFunction` accepts
// both arrow AND fn-expression callees, so the proxy-global chain `.Map.prototype.has`
// resolves through the inline-return same way as the arrow case
const has = _Map.prototype.has;
new _Map().has !== has;