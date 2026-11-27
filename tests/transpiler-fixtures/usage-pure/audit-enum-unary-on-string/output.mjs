import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// Unary numeric operators produce numbers, including when the operand is a string.
// Only the two explicit String reads use string helpers.
enum N {
  A = +'42',
  B = -3,
  C = ~0
}
declare const v: N;
const tag = String(v);
_atMaybeString(tag).call(tag, 0);
_includesMaybeString(tag).call(tag, 'A');
// @ts-expect-error probe a method absent from at least one enum member
typeof v.at;