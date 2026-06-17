import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// Numeric enums have reverse mapping at runtime: `enum E { A, B }; E[E.A] === 'A'`
// (string). `resolveEnumMemberAccess` distinguishes the two member-access shapes on a
// TSEnumDeclaration receiver: non-computed `E.A` -> value-kind (number), computed
// `E[<number>]` -> string (reverse mapping for numeric enums). `v` resolves to string
// here, so `v.includes('A')` narrows to `_includesMaybeString` instead of generic `_includes`
enum E {
  A,
  B,
}
declare const arr: number[];
const v = E[E.A];
_includesMaybeString(v).call(v, 'A');
_atMaybeArray(arr).call(arr, 0);