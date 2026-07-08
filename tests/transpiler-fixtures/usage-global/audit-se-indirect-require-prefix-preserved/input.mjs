// An existing core-js require is removed in usage mode (the plugin re-injects the module), but an INDIRECT
// require `(spy(), require)("core-js/...")` carries a side-effect prefix. The removal extracts that prefix -
// the callee's AND an outer comma sequence's (`0, (spy(), require)(...)` keeps `spy()`) - as bare statements
// via the same helper the entry path uses. The emitted prefix stays VISITED, so any polyfillable usage
// inside it (`arr.includes` -> `es.array.includes`) is still injected. An OPTIONAL indirect require
// (`...?.("core-js/X")`) is handled too - estree nests it under a ChainExpression.
let loads = 0;
(loads++, require)("core-js/modules/es.array.from");
let arr = [1];
(arr.includes(1), require)("core-js/modules/es.array.includes");
let opt = 0;
(opt++, require)?.("core-js/modules/es.array.from");
let outer = 0;
0, (outer++, require)("core-js/modules/es.array.of");
Array.from([1]);
