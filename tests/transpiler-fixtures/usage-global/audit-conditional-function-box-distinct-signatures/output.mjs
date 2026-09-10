import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A call signature keeps none of its parameters here - every one resolves into the same `Function`
// box - so two containers over different signatures read as one type. tsc compares the signatures:
// a one-parameter callback is not assignable to a zero-parameter target, so the FALSE branch is the
// answer and an array-only `at` keyed to it would run on a string.
type Sel<T> = T extends Array<() => void> ? number[] : string;
declare const v: Array<(n: number) => void>;
declare const r: Sel<typeof v>;
r.at(0);