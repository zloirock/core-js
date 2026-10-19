const arr: string[] = ['hello', 'world'];
const [first]: unknown[] = arr;
// @ts-expect-error the read sees the value the source assigned, which the declared type does not carry
first.at(0);
