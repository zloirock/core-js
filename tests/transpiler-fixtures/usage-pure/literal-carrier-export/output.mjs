import _at from "@core-js/pure/actual/instance/at";
// Exporting the carrier exposes its nested literal, so its fields require generic dispatch.
const box = {
  data: [1, 2]
};
export const wrap = {
  inner: box
};
export const at = _at(box.data);