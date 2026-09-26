// Array evaluation finishes before the nested object read.
const [{ a, y: { flat } }] = [{ a: record("init"), y: [1, [2]] }, record("rhs")];
export { a, flat };
