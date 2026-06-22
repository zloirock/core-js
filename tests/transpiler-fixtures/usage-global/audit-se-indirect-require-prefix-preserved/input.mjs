// An existing core-js require is removed in usage mode (the plugin re-injects the module), but an INDIRECT
// require `(spy(), require)("core-js/...")` carries a side-effect prefix in its callee. The removal keeps
// the callee as a bare statement so the prefix still runs. The kept callee also stays VISITED, so any
// polyfillable usage inside it (`arr.includes` -> `es.array.includes`) is still injected. An OPTIONAL
// indirect require (`...?.("core-js/X")`) is handled too - estree nests it under a ChainExpression.
let loads = 0;
(loads++, require)("core-js/modules/es.array.from");
let arr = [1];
(arr.includes(1), require)("core-js/modules/es.array.includes");
let opt = 0;
(opt++, require)?.("core-js/modules/es.array.from");
Array.from([1]);
