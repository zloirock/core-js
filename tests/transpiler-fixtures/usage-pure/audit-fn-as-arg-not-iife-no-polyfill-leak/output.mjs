// FunctionExpression passed as an arg to an outer call must NOT be classified as an
// IIFE. inline pattern-matching previously walked wrappers up from the callback,
// landed on the outer CallExpression / NewExpression, and used its args as the IIFE's
// caller-args - so `{from}` was rewritten to `Array.from` inside the callback even
// though doStuff might pass a totally different value as `args[1]` to its callback.
// shared `findIifeCallSite` adds the callee-identity gate that rejects this case.
declare function doStuff(...args: any[]): any;
const x = doStuff(Array, function ({
  from
}) {
  return from([1, 2, 3]);
});