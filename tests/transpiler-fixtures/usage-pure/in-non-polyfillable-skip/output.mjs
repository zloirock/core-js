import _Promise from "@core-js/pure/actual/promise/constructor";
// `customMethod` is not a known polyfillable static of `Promise`, so the `in`-check is
// not rewritten as a hasOwn-style dispatch. The receiver `Promise` is still polyfilled.
// Plain `'x' in obj` has no runtime built-in receiver, so it stays as-is.
'customMethod' in _Promise;
'x' in obj;