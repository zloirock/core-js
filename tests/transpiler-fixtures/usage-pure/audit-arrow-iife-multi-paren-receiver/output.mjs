import _Array$from from "@core-js/pure/actual/array/from";
// arrow IIFE wrapped in multiple parens: every ParenthesizedExpression layer must be
// peeled to reach the CallExpression, otherwise the rewrite falls back to inline-default
// emission and the receiver `Array` stays unpolyfilled at runtime
(({
  from
}) => from(1))({
  from: _Array$from
});