import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// Numeric enums have reverse mapping at runtime: `enum E { A, B }; E[E.A] === 'A'`
// (string). On a TSEnumDeclaration receiver, non-computed `E.A` resolves to value-kind
// (number) while computed `E[<number>]` resolves to string (reverse mapping). `v` is the
// string form here, so `v.includes('A')` narrows to `_includesMaybeString` not `_includes`.
enum E {
  A,
  B,
}
declare const arr: number[];
const v = E[E.A];
_includesMaybeString(v).call(v, 'A');
_atMaybeArray(arr).call(arr, 0);