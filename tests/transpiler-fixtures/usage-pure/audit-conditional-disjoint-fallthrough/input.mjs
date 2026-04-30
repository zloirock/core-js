// conditional `T extends U[] ? U : T` with the check side and the extends side
// resolved to disjoint concrete types (`number[]` vs `string[]`). the conditional
// should pick its false-branch (T = `number[]`) the same way TS evaluates it,
// yielding the array-specific instance polyfill
type Foo<T, U> = T extends U[] ? U : T;
declare function probe<T, U>(): Foo<T, U>;
const r = probe<number[], string>();
r.at(0);
