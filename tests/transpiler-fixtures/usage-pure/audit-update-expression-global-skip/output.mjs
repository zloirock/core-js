import _Map from "@core-js/pure/actual/map/constructor";
// UpdateExpression on polyfillable identifier: must NOT replace.
// Before TS wrappers too.
let x = _Map;
x++;
(Map as unknown)!++;
--Promise;
Set! --;