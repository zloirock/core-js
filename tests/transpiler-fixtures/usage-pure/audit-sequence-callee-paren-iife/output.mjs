import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// SequenceExpression in callee position: `(0, fn)(arg)` IIFE form. inner IIFE-callee
// peel detects safe-SE-free SequenceExpression and unwraps to tail. both parsers must
// agree after peel chain SE -> ArrowFunction
const a = (0, ({
  from
}) => from(1))({
  from: _Array$from
});
const b = (0, ({
  of
}) => of(3))({
  of: _Array$of
});