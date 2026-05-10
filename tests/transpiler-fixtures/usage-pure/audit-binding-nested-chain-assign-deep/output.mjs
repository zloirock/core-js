import _Array$from from "@core-js/pure/actual/array/from";
// nested chain-assign with intermediate parens: oxc preserves ParenthesizedExpression
// around the inner `(b = Array)`, so a flat one-pass peel exits after the outer `=`.
// resolveObjectName must alternate paren-peel + chain-assign-peel to a fixpoint
const X = a = b = Array;
_Array$from([]);