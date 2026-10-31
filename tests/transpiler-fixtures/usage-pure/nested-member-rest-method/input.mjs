// A copied method can run with the rest copy as this and a different field type.
const wrap = { box: { data: [10, 20], read() { return this.data.includes("02"); } } };
const { ...copy } = wrap.box;
copy.data = "1020";
export const result = copy.read();
