// Rest above the object copies its reference, so writes through the copy widen its fields.
const wrap = { box: { data: [1, 2] } };
const { ...copy } = wrap;
copy.box.data = "abc";
export const { at } = wrap.box.data;
