import _Array$from from "@core-js/pure/actual/array/from";
// `(0, fn)(arg)` IIFE - minifiers emit this pattern to drop `this`-binding. The callee
// is a SequenceExpression `(0, fn)`; the semantic invoked function is the tail. The
// IIFE-callee peel handles paren / TS / chain wrappers AND safe-SE tails (preceding
// slots side-effect-free) so the param-default synth-swap fires through the wrapped form
(0, ({
  from
} = {
  from: _Array$from
}) => from([1, 2]))();