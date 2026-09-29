// A rest assignment copies fields without exposing the source object.
const wrap = { box: { data: [1, 2] } };
let copy;
({ ...copy } = wrap.box);
export const { at } = wrap.box.data;
