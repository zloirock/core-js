// undecidable conditional whose one branch is `null` should narrow to the other branch's
// type for member-dispatch — TS-style narrowing strips null from value-position unions
type Wrap<T> = T extends never ? null : T[];
declare const a: Wrap<string>;
a.at(0);
