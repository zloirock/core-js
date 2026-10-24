import "core-js/modules/es.array.at";
const x: object = [1, 2, 3];
// @ts-expect-error the read sees the value the source assigned, which the declared type does not carry
x.at(-1);