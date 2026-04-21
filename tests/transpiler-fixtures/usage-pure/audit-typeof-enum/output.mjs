import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// `typeof Enum.Member` / member access through `typeof Enum` annotation: enum is a
// type-bearing decl without a typeAnnotation slot. resolveAnnotatedMember recognises
// TSTypeQuery-to-TSEnumDeclaration and maps each member to its initializer kind
// ($Primitive('string') here), so `.at(0)` narrows to the String instance method
enum Color {
  Red = 'r',
  Green = 'g',
}
declare const cons: typeof Color;
_atMaybeString(_ref = cons.Red).call(_ref, 0);