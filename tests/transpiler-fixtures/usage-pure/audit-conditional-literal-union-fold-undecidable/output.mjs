import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// an undecidable inner conditional folds two DISAGREEING string-literal branches into a literal UNION
// (`'a' | 'b'`). that fold is a string for member dispatch, but it is OPAQUE for an outer conditional -
// its members are not retained - so a relation against any narrow type (a single literal OR another
// literal union) is undecidable and folds BOTH outer branches down to the GENERIC helper. the picker must
// treat the union as undecidable on EITHER side: as the CHECK (`('a'|'b') extends 'a'`) and as the EXTEND
// (`'c' extends ('a'|'b')`). a stale `.literal` would mis-fire the both-literal rule (-> string ->
// `_atMaybeString`, which THROWS on a non-string off-engine); a bare-family fold would mis-fire the
// wide-vs-narrow rule. only a BARE keyword resolves against a union: `string extends ('a'|'b')` is wider,
// so it is decidably FALSE -> the array branch -> the array-specific helper (not read as a keyword extend)
type Inner<T> = T extends number ? "a" : "b";
type OuterCheck<T> = Inner<T> extends "a" ? string : number[];
declare const checkUnion: OuterCheck<unknown>;
export const a = _at(checkUnion).call(checkUnion, 0);
type OuterExtend<T> = "c" extends Inner<T> ? string : number[];
declare const extendUnion: OuterExtend<unknown>;
export const b = _includes(extendUnion).call(extendUnion, "x");
type OuterWide<T> = string extends Inner<T> ? string : number[];
declare const wide: OuterWide<unknown>;
export const c = _flatMaybeArray(wide).call(wide);