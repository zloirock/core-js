// an overload SIGNATURE key and an `abstract accessor` key are both source-text member names, yet they
// answer the UID question in OPPOSITE directions: babel's live scope claims the bodyless signature but
// not the accessor. so the memo must step OVER `_ref` (taken by the overload) and land on `_ref2` (left
// free by the accessor) - one number proves both halves. the class overload shares its node type with a
// body-bearing method in one of the parsers, so only the missing body separates them.
// a global-shaped overload key must survive unrewritten, same as any other member name.
// distinct method per line.
class Over { _ref(): void; _ref(x?: number) {} }
abstract class Acc { abstract accessor _ref2: number; }
export const r1 = [10, 20].at(0);
export const r2 = [[1], [2]].flat();
class Contract { Map(): void; Map(x?: number) {} }
export const r3 = new Map();
export { Over, Acc, Contract };
