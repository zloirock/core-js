// Exporting the carrier exposes its nested literal, so its fields require generic dispatch.
const box = { data: [1, 2] };
export const wrap = { inner: box };
export const { at } = box.data;
