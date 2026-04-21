// `typeof Enum.Member` / member access through `typeof Enum` annotation: enum is a
// type-bearing decl without a typeAnnotation slot. resolveAnnotatedMember recognises
// TSTypeQuery-to-TSEnumDeclaration and maps each member to its initializer kind
// ($Primitive('string') here), so `.at(0)` narrows to the String instance method
enum Color { Red = 'r', Green = 'g' }
declare const cons: typeof Color;
cons.Red.at(0);
