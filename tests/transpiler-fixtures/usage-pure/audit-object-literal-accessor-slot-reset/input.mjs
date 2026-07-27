// an object literal defines its keys in source order on ONE object, so a data definition resets the
// slot to a data descriptor and a trailing setter then leaves it setter-only: reading yields
// undefined and the getter behind the data property is dead, so nothing may be narrowed from it.
// the second row is the boundary - a getter/setter PAIR with no data between still reads through
// the getter. both rows use a method carrying an array AND a string variant, so "type-agnostic
// entry" and "array-specific entry" are visible as different helpers
const reset = { get a() { return [1]; }, a: 5, set a(v) {} };
reset.a.includes(1);
const paired = { get b() { return [1]; }, set b(v) {} };
paired.b.at(0);
