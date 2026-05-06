import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// Enum nested inside a namespace: `namespace N { enum E { A, B } }`. Member access
// `N.E[N.E.A]` is a numeric reverse mapping at runtime -> string.
// `resolveEnumMemberAccess` walks the receiver via `collectMemberSegments` (collects
// `[N, E]` from MemberExpression chain) and passes the segments to `findEnumDeclaration`
// which traverses TSModuleDeclaration anchors via `walkStatementsForDecl`. with namespaced
// support, `head` resolves to string -> emits `_includesMaybeString` instead of generic
namespace N {
  export enum E { A, B }
}
const head = N.E[N.E.A];
_includesMaybeString(head).call(head, 'A');