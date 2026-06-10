import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref, _ref2;
// type-member edges: a no-subst conditional takes the structurally PICKED branch (folding
// both leaked the dead branch); an empty-string key is a valid static name; a getter called
// AS a method is not callable (generic), while reading it keeps the value narrow
type P<X> = X extends string ? string[] : number[];
declare const v: P<'a'>;
_atMaybeArray(v).call(v, 0);
declare const obj: { '': string[] };
_atMaybeArray(_ref = obj['']).call(_ref, 1);
interface I { get items(): number[] }
declare const i: I;
_atMaybeArray(_ref2 = i.items).call(_ref2, 2);