import _includes from "@core-js/pure/actual/instance/includes";
// optional-chain paren-detach preservation: `(arr?.includes)(1)` keeps the parenthesized
// detach (`(_includes(arr))(1)` - no `.call(arr)` injection). The paren-detection check
// covers both the default parser's `extra.parenthesized` flag and the
// `createParenthesizedExpressions: true` `ParenthesizedExpression` node form
const v = (arr == null ? void 0 : _includes(arr))(1);