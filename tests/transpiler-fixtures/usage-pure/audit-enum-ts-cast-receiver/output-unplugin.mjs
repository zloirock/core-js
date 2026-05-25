import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// `(N as typeof N).E.A` - TS-cast wrapper on a namespaced enum receiver.
// collectMemberSegments must peel TS expression wrappers / ParenthesizedExpression / ChainExpression
// to recover the ['N', 'E'] segment array, otherwise the enum-lookup short-circuits on
// the first hop (path.node.object is a TSAsExpression wrapper, not a MemberExpression).
// without the peel, `(N as typeof N).E.A`'s value type stays unknown and `.at()` falls
// back to generic; with the peel, the string-enum literal type narrows the receiver to
// string and `_atMaybeString` ships
namespace N {
  export enum E { A = "alpha", B = "beta" }
}
_atMaybeString(_ref = (N as typeof N).E.A).call(_ref, 0);