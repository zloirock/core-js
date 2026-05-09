import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// undecidable conditional with indexed-access: `T extends 'a' ? {items:number[]} :
// {items:string}` cannot pick a branch when T is unconstrained. fold of trueType /
// falseType members through indexed access yields a synthetic union for `r.items` -
// dispatch on `r.items.at(0)` must narrow correctly (both branches have arrays / strings)
type Wrap<T> = T extends 'a' ? {
  items: number[];
} : {
  items: string;
};
declare const r: Wrap<string>;
_atMaybeArray(_ref = r.items).call(_ref, 0);