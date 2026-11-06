import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// outer chain-assign wraps an inner chain-assign whose RHS has observable side
// effects (the IIFE). the outer's evaluation already runs the inner AE once;
// descending past the outer to also collect the inner would double-evaluate the
// IIFE in the emitted prelude
let a, b;
const r = (a = (b = (() => _globalThis)()).Array, _Array$from)([1]);
[r, a, b];