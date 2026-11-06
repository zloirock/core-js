import _Array$from from "@core-js/pure/actual/array/from";
// deeply-nested comma-expression + paren wrappers around the IIFE callee:
// `(((0, ((0, arrow))))(arg)`. The IIFE-callee peel alternates between paren and
// comma-tail peels in its while loop, so multiple layers don't break detection. exercises
// fixed-point convergence on stacked wrappers
(0, 0, ({
  from
} = {
  from: _Array$from
}) => from([1, 2]))();