import "core-js/modules/es.string.at";
const IDX = 0 as const;
const arr = ['hello', 42];
// @ts-expect-error the read sees the value the source assigned, which the declared type does not carry
arr[IDX].at(0);