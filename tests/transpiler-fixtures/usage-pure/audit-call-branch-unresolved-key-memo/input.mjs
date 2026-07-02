// multi-key destructure from a conditional with an inline-call branch and an UNRESOLVED key:
// the call result is memoized through a function-IIFE param - the call runs exactly once (as
// the argument) and the unresolved key reads the memo instead of re-running the call
let cond = true;
let c = 0;
const { from, custom } = cond ? (() => { c++; return Array; })() : Array;
from([1]);
