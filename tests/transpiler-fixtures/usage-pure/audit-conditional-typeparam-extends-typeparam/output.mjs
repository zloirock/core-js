import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// conditional with typeparam-extends-typeparam: `T extends U` where U is also a
// typeparam. raw `extendsType=U` AST has no typeArguments and reads as unconstrained,
// but at the call-site U substitutes to a concrete shape (`Array<string>`). branch
// picker must see the post-subst shape, not the pre-subst typeparam ref - otherwise
// the empty-tuple / disjoint-inner case fires the wrong (true) branch
type Cond<T, U> = T extends U ? string[] : number[];
declare function probe<T, U>(): Cond<T, U>;
const r = probe<Array<number>, Array<string>>();
_atMaybeArray(r).call(r, 0);