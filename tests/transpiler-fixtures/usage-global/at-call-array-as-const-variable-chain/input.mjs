const arr = ['hello', 42];
// @ts-expect-error a const assertion on a reference, which tsc refuses, is the shape under test
const ref = arr as const;
// @ts-expect-error the read sees the value the source assigned, which the declared type does not carry
ref[0].at(0);
