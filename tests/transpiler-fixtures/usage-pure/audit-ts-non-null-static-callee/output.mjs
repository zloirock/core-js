import _Array$from from "@core-js/pure/actual/array/from";
// TS `!` non-null on a static callee `Array.from!([1])`: the wrapper is peeled and
// the static call rewritten to the pure-mode polyfill.
_Array$from([1]);