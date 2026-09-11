// 3-deep JSXMemberExpression chain inside decorator (`@(<Map.A.B />) class C {}`).
// the root global must resolve to `Map` regardless of chain depth, walking `.object`
// from the root Identifier through nested JSXMemberExpression hops up to the tag name.
// Set chain on the second class confirms depth-2 also works (per-class distinct global).
@(<Map.Foo.Bar />)
class WithMapRoot {}
@(<Set.X />)
class WithSetRoot {}
