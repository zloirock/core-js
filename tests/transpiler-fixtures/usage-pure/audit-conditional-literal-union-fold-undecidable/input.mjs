// an undecidable inner conditional folds two DISAGREEING string-literal branches into a literal UNION
// (`'a' | 'b'`), and the fold KEEPS its members: a string for member dispatch, and a set of keys for an
// outer conditional. The set answers the two ends of the relation and only those - a check whose members
// all sit inside the extends side holds for each of them, a pair sharing no member fails for each alike,
// and a PARTIAL overlap is both at once and stays open. So the three outer relations here part: the CHECK
// (`('a'|'b') extends 'a'`) overlaps and folds BOTH branches down to the GENERIC helper; the EXTEND
// (`'c' extends ('a'|'b')`) shares no member and takes the array branch whichever arm the inner
// conditional really has; and a BARE keyword against the union (`string extends ('a'|'b')`) is wider, so
// the wide-vs-narrow rule answers it. A stale `.literal` would mis-fire the both-literal rule (-> string
// -> `_atMaybeString`, which THROWS on a non-string off-engine); a bare-family fold would mis-fire the
// wide-vs-narrow one. `tsc` reads all three as `number[]`, so every helper here is an array-side or
// generic one and never the string-side
type Inner<T> = T extends number ? "a" : "b";

type OuterCheck<T> = Inner<T> extends "a" ? string : number[];
declare const checkUnion: OuterCheck<unknown>;
export const a = checkUnion.at(0);

type OuterExtend<T> = "c" extends Inner<T> ? string : number[];
declare const extendUnion: OuterExtend<unknown>;
export const b = extendUnion.includes("x");

type OuterWide<T> = string extends Inner<T> ? string : number[];
declare const wide: OuterWide<unknown>;
export const c = wide.flat();
