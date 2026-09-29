// Replacing a field on the rest copy does not change the source field or its string type.
const wrap = { box: { data: "abc" } };
const { ...copy } = wrap.box;
copy.data = [1, 2];
export const { at } = wrap.box.data;
