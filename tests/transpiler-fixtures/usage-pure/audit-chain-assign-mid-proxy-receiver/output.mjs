import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// chain-assignment buried inside the receiver chain, not at its top level;
// the assignment must still run when the polyfill replaces the receiver
let a;
const r = (a = _globalThis, _Array$from)([1, 2, 3]);
[r, a];