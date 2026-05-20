// `(N as typeof N).E.A` - TS-cast wrapper on a namespaced enum receiver.
// collectMemberSegments must peel TS_EXPR_WRAPPERS / ParenthesizedExpression / ChainExpression
// to recover the ['N', 'E'] segment array, otherwise the enum-lookup short-circuits on
// the first hop (path.node.object is a TSAsExpression wrapper, not a MemberExpression).
// without the peel, `(N as typeof N).E.A`'s value type stays unknown and `.at()` falls
// back to generic; with the peel, the string-enum literal type narrows the receiver to
// string and `_atMaybeString` ships
namespace N {
  export enum E { A = "alpha", B = "beta" }
}
(N as typeof N).E.A.at(0);

