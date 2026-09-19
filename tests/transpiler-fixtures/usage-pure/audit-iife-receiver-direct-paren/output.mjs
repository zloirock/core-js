import _Array$from from "@core-js/pure/actual/array/from";
// IIFE arg directly wrapped in parens (no comma expression) when the parser preserves
// parens as AST nodes: the paren peel runs at the entry of IIFE-arg resolution so the
// inner identifier `Array` reaches the receiver classifier and the rewrite emits
// `{from: _Array$from}` instead of falling back to a per-key destructure-default
(({
  from
}) => from([1]))(({
  from: _Array$from
}));