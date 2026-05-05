// `resolveEnumMemberKind` covers StringLiteral / NumericLiteral / TemplateLiteral / BinaryExpression
// / UnaryExpression. BigIntLiteral / 'Literal' (oxc) for bigint is NOT in the table, so a member
// initialized with a BigInt literal returns null kind -> resolveEnumType bails -> `typeof Bag`
// member access falls through to generic dispatch. distinct methods make the resolution observable.
enum Bag {
  Big = 100n,
  Small = 1n,
}
declare const v: Bag;
const tag = String(v);
tag.at(0);
tag.includes('1');
