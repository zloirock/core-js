import _Array$from from "@core-js/pure/actual/array/from";
// multi-key destructure from a conditional with an inline-call branch and an UNRESOLVED key:
// the call result is memoized through a function-IIFE param - the call runs exactly once (as
// the argument) and the unresolved key reads the memo instead of re-running the call
let cond = true;
let c = 0;
const { from, custom } = cond ? (function (_ref) { return { from: _Array$from, custom: _ref.custom }; })((() => { c++; return Array; })()) : { from: _Array$from, custom: Array.custom };
from([1]);