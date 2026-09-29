import _at from "@core-js/pure/actual/instance/at";
// Passing the carrier to an unknown consumer exposes the nested literal and widens its fields.
const box = {
  data: [1, 2]
};
const wrap = {
  inner: box
};
sink(wrap);
export const at = _at(box.data);