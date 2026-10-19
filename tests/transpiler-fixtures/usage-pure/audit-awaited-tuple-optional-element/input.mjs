// an optional element does not change the answer: a tuple is not thenable whatever its element
// structure, so `Awaited<[A, B?]>` is that tuple and element 0 stays the Promise it was written as
type T = Awaited<[Promise<number[]>, Promise<string[]>?]>;
declare const t: T;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
t[0].at(0);
