// `Reflect.construct(C, [], D)` builds an object with `D.prototype`, so the result is a D instance,
// not a C instance. Resolving the constructor from the 3rd argument (newTarget) reaches `D.m`,
// whose `string` return drives the string-specific `.at` polyfill - not `C.m`'s array.
class C { m() { return [1, 2, 3]; } }
class D { m() { return "string"; } }
Reflect.construct(C, [], D).m().at(0);
