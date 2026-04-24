// TSEnumDeclaration with numeric members - expect $Primitive('number'); .toFixed is
// Number.prototype, not polyfilled. Using .at() on number coerces via wrapper => bails.
// Use a number-ok polyfill: the best candidate here is that enum as array index.
enum Color { Red, Green, Blue }
declare const c: Color;
const arr: string[] = ['a', 'b', 'c'];
arr.at(c);
