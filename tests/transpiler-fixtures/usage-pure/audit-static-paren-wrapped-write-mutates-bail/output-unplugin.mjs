import _Array$of from "@core-js/pure/actual/array/of";
// paren-wrapped LHS `(Array.from) = X`: oxc keeps a ParenthesizedExpression around the
// MemberExpression while babel strips it. mutation detection must peel the paren wrapper
// in both parsers so the post-assignment `Array.from` call stays verbatim. `Array.of` on
// the same constructor is unmutated and must still be polyfilled.
(Array.from) = function () { return []; };
Array.from([1, 2, 3]);
_Array$of(4, 5);