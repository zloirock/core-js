// FunctionExpression passed as an arg to an outer call must NOT be classified as an
// IIFE. walking wrappers up from the callback would land on the outer CallExpression /
// NewExpression and treat its args as the callback's caller-args - so `{from}` gets
// rewritten to `Array.from` inside the callback even though doStuff might pass a totally
// different value as `args[1]`. the callee-identity gate rejects this case.
declare function doStuff(...args: any[]): any;
const x = doStuff(Array, function ({ from }) {
  return from([1, 2, 3]);
});
