import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// String conversion and a direct enum operand exercise different receiver decisions.
enum Bag {
  // @ts-expect-error an enum member tsc refuses is the shape under test
  Big = 100n,
  // @ts-expect-error an enum member tsc refuses is the shape under test
  Small = 1n
}
declare const v: Bag;
const tag = String(v);
_atMaybeString(tag).call(tag, 0);
_includesMaybeString(tag).call(tag, '1');
// @ts-expect-error probe a method absent from at least one enum member
typeof v.at;