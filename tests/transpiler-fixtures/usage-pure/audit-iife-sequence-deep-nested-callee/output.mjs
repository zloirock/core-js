import _Array$from from "@core-js/pure/actual/array/from";
// deeply-nested SE + paren wrappers around the IIFE callee: `(((0, ((0, arrow))))(arg)`.
// `peelIifeCallee` alternates between paren / SE peels in its while loop, so multiple
// layers don't break detection. companion to `audit-iife-sequence-callee/` covering the
// fixed-point convergence
(0, 0, ({
  from
} = {
  from: _Array$from
}) => from([1, 2]))();