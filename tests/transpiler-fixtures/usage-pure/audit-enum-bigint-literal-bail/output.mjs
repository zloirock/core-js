import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// `resolveEnumMemberKind` covers StringLiteral / NumericLiteral / TemplateLiteral / BinaryExpression
// / UnaryExpression. BigIntLiteral / 'Literal' (oxc) for bigint is NOT in the table, so a member
// initialized with a BigInt literal returns null kind -> resolveEnumType bails -> `typeof Bag`
// member access falls through to generic dispatch. distinct methods make the resolution observable.
enum Bag {
  Big = 100n,
  Small = 1n
}
declare const v: Bag;
const tag = String(v);
_atMaybeString(tag).call(tag, 0);
_includesMaybeString(tag).call(tag, '1');