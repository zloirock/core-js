// `typeof Enum` with a numeric enum — `resolveAnnotatedMember`'s TSTypeQuery branch
// maps each member to `$Primitive('number')` via `resolveEnumMemberType`; `.toExponential`
// on a number narrows to the Number instance method
enum Num { A = 1, B = 2 }
declare const e: typeof Num;
e.A.toExponential(2);
