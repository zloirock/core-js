// Passing the carrier to an unknown consumer exposes the nested literal and widens its fields.
const box = { data: [1, 2] };
const wrap = { inner: box };
sink(wrap);
export const { at } = box.data;
