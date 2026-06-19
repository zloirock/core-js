import _Array$from from "@core-js/pure/actual/array/from";
// a multi-element ArrayPattern wrapper whose consumed element is a DIVERGING ternary
// (`[0, useGlobal ? globalThis : userObj]`). the receiver-aware mirror descends the array wrapper to
// the element and swaps only the proxy branch INSIDE it - the user-object branch stays native (its
// own `from` is preserved, no corruption), the proxy branch binds the polyfill. an unconditional bind
// (`const from = _polyfill`) would read the polyfill on the user branch too; a bare element extracts
const userObj = { Array: { from: () => [] } };
const useGlobal = false;
const [, { Array: { from } }] = [0, useGlobal ? { Array: { from: _Array$from } } : userObj];
typeof from;
