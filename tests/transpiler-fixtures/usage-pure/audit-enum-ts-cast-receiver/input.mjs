// `(N as typeof N).E.A` - TS-cast wrapper on a namespaced enum receiver. The member-segment
// walk must peel TS wrappers / ParenthesizedExpression / ChainExpression to recover the
// ['N', 'E'] path, otherwise the enum lookup short-circuits on the first hop (the object is
// a TSAsExpression, not a MemberExpression) and the string-enum narrow to `_atMaybeString` is lost.
namespace N {
  export enum E { A = "alpha", B = "beta" }
}
(N as typeof N).E.A.at(0);

