// cyclic generic default `type R<T = R<T>>`: substitution must not loop and must not
// exhaust the recursion budget. cycle-detection short-circuits on a repeated visit of the
// same alias via the propagated seen-set
// @ts-expect-error a cyclic type tsc refuses is the shape under test
type R<T = R<T>> = { value: T };
declare const x: R<number[]>;
x.value.at(-1);
