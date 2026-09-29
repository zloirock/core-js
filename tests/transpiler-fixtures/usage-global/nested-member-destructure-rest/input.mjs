// A rest copy reads field values without exposing the source object or widening its fields.
const wrap = { box: { data: [1, 2] } };
const { ...rest } = wrap.box;
export const { at } = wrap.box.data;
