// IIFE with params shadowing free identifiers in body - `inlineCallReturnExpression` bails
// when `callee.params?.length`. body's `Map` could resolve to a param value, not the global,
// so resolve returns null. arrow with no params is the only inline-able form
const a = ((Map) => Map)(WeakMap).has(1);
// fn-expression IIFE with params equally bails
const b = (function(Set) { return Set; })(WeakSet).has(1);
export { a, b };
