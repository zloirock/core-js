const items: string[] = ['hello'];
const [x]: unknown[] = items;
// @ts-expect-error the read sees the value the source assigned, which the declared type does not carry
x.at(0).bold();
