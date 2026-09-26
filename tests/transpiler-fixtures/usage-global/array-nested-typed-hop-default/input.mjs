// Array evaluation finishes before the nested object read.
const receiver = [1, [2]];
const [{ flat: { at } = [] }] = [receiver, record("rhs")];
export { at };
