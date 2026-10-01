import _at from "@core-js/pure/actual/instance/at";
// conditional with check and extends sides on different non-primitive constructors:
// `Array<number>` vs `Date`. the supertype table decides only the pairs it CARRIES - the container
// families and the paths between them - because the constructor registry holds hierarchies of its
// own (`RangeError` under `Error`), and a FALSE off a bare name difference is the wrong answer for
// every one of them. a pair the table does not name is left undecided, and the two branches don't
// share a common outer, so the result widens to unknown and the generic instance polyfill is emitted
type Foo<T> = T extends Date ? string[] : number;
declare function probe<T>(): Foo<T>;
const r = probe<Array<number>>();
_at(r).call(r, 0);