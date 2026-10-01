// an optional element does not change the answer: a tuple is not thenable whatever its element
// structure, so `Awaited<[A, B?]>` is that tuple and element 0 stays the Promise it was written as
type T = Awaited<[Promise<number[]>, Promise<string[]>?]>;
declare const t: T;
t[0].at(0);
