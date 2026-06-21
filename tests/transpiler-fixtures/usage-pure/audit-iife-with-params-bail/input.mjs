// IIFE with params shadowing free identifiers in body - inline-call resolution must bail
// when the callee has params. body's `Map` could resolve to a param value, not the global,
// so resolution returns null. arrow with no params is the only inline-able form
const a = ((Map) => Map)(WeakMap).has(1);
// fn-expression IIFE with params equally bails
const b = (function(Set) { return Set; })(WeakSet).has(1);
export { a, b };
