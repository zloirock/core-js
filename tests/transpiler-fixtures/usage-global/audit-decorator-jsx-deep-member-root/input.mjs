// 3-deep JSXMemberExpression chain inside decorator (`@(<Map.A.B />) class C {}`).
// `jsxIdentifierVisitor` walks `.object` from the root Identifier through nested
// JSXMemberExpression hops until it lands on JSXOpeningElement.name - root global
// resolves to `Map` regardless of chain depth. Set chain on second class confirms
// depth-2 also works (per-class distinct global pins emission)
@(<Map.Foo.Bar />)
class WithMapRoot {}
@(<Set.X />)
class WithSetRoot {}
