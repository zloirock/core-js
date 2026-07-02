// identity IIFE with multi-element inline-array spread - effective length counts ALL
// elements (`...[Array, 1, 2]` -> 3 positions), positional match lifts the param at index
// 0 (`Array`). validates that `effective-args length` + `call-argument resolver` stay symmetric
// on expansion across multiple elements
const ctor = ((arr, _x, _y) => arr)(...[Array, 1, 2]);
ctor.from([1, 2, 3]);
