import _Array$from from "@core-js/pure/actual/array/from";
// `(0, fn)(arg)` IIFE - minifiers emit this pattern to drop `this`-binding. callee is
// SequenceExpression `(0, fn)`; semantic invoked function is the tail. without the SE
// peel `findIifeCallSite` rejected the call and the param-default synth-swap never fired.
// fix: `peelIifeCallee` peels safe-SE tails (preceding slots side-effect-free) in addition
// to paren / TS / chain wrappers
(0, ({
  from
} = {
  from: _Array$from
}) => from([1, 2]))();