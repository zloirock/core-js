// NESTED conditional with TWO SE-bearing call branches and an unresolved key: each call leaf
// gets its OWN memoized function-IIFE param (numbered consistently), each branch literal carries
// that branch's polyfill, and the plain leaf keeps the mixed literal. only the taken branch's
// call runs, exactly once
let a = true;
let b = false;
let c = 0;
const { from, custom } = a ? (() => { c++; return Array; })() : (b ? (() => { c++; return Iterator; })() : Array);
from([1]);
