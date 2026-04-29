import _Array$from from "@core-js/pure/actual/array/from";
// arrow IIFE wrapped in multiple parens: every paren wrapper layer must be peeled to
// reach the call expression, otherwise the rewrite falls back to a destructure-default
// shape and the receiver `Array` stays unpolyfilled at runtime
(({
  from
}) => from(1))({
  from: _Array$from
});