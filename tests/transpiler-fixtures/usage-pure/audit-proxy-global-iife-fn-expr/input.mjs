// FunctionExpression IIFE returning proxy-global - `resolveInlineCalleeFunction` accepts
// both arrow AND fn-expression callees, so the proxy-global chain `.Map.prototype.has`
// resolves through the inline-return same way as the arrow case
const has = (function () { return globalThis; }()).Map.prototype.has;
new Map().has !== has;
