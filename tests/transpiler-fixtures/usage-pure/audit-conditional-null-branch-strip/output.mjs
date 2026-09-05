import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// undecidable conditional whose one branch is `null` should narrow to the other branch's
// type for member-dispatch  -  TS-style narrowing strips null from value-position unions
type Wrap<T> = T extends never ? null : T[];
declare const a: Wrap<string>;
_atMaybeArray(a).call(a, 0);