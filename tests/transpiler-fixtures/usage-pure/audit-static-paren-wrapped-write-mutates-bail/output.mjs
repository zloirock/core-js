import _Array$of from "@core-js/pure/actual/array/of";
// paren-wrapped LHS `(Array.from) = X` parses as
// AssignmentExpression{left: ParenthesizedExpression{expression: MemberExpression}}
// under oxc (createParenthesizedExpressions). babel strips parens, so the AST is the
// same as the unwrapped form. mutation detection must peel the paren wrapper in both
// parsers so the post-assignment call to Array.from stays verbatim. Array.of on the
// same constructor is unmutated and must still be polyfilled.
Array.from = function () {
  return [];
};
Array.from([1, 2, 3]);
_Array$of(4, 5);