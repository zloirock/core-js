// a class EXPRESSION's inner name (`K1` in `const C1 = class K1 {}`) is bound inside its own body: a
// static read through it takes its polyfill in a static block, a method, a field, a destructure, an
// arrow, parenthesized or as an argument, under any outer binding kind; a write through it keeps the
// read native, and so does a computed key, which evaluates in the inner name's TDZ
const C1 = class K1 { static M = Map; static { use(K1.M.groupBy); } };
const C2 = class K2 { static O = Object; static f() { return K2.O.groupBy; } };
const C3 = class K3 { static P = Promise; static t = K3.P.try; };
const C4 = class K4 { static I = Iterator; static { const { from: f4 } = K4.I; use(f4); } };
const C5 = (0, class K5 { static A = Array; static f() { return K5.A.fromAsync; } });
const C6 = (class K6 { static E = Error; static { use(K6.E.isError); } });
let C7 = class K7 { static P = Promise; static f() { return K7.P.withResolvers; } };
var C8 = class K8 { static M = Math; static { const g = () => K8.M.sumPrecise; use(g); } };
let C9;
C9 = class K9 { static O = Object; static f() { return K9.O.fromEntries; } };
const C10 = class K10 { static N = Number; static { K10.N = Set; use(K10.N.isInteger); } };
const C11 = class K11 { static A = Array; [K11.A.of]() {} };
