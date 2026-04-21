// UpdateExpression on polyfillable identifier: must NOT replace.
// Before TS wrappers too.
let x = Map;
x++;
(Map as unknown)!++;
--Promise;
Set!--;
