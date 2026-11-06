// Array evaluation finishes before the nested object read.
const receiver = { get y() { record("get"); return [1, 2]; } };
const [{ y: { at } = [] }] = [receiver, record("rhs")];
export { at };
