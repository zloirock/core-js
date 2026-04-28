import _includes from "@core-js/pure/actual/instance/includes";
// regression for the OPTIONAL branch in `replaceInstanceLike` (`isWrappedInParens` +
// `path.isOptionalMemberExpression()`): `(arr?.includes)(1)` must keep the parenthesized
// detach by emitting `(_includes(arr))(1)` (no `.call(arr)` injection). pre-fix detection
// relied on `path.node.extra?.parenthesized` only - createParens=true keeps a
// `ParenthesizedExpression` node instead, so the flag was unset and the optional-paren
// branch missed. post-fix `isWrappedInParens` checks both flag form (default parser)
// and node form (createParens=true) and routes correctly to the preserve-detach branch
const v = (arr == null ? void 0 : _includes(arr))(1);