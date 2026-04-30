// conditional type with concrete check: `T extends string ? string[] : number`. when
// T is bound to `string`, the check matches the extends side, the true-branch resolves
// to `string[]`, and the array-specific instance polyfill is picked
type Foo<T> = T extends string ? string[] : number;
declare function probe<T>(): Foo<T>;
const r = probe<string>();
r.at(0);
