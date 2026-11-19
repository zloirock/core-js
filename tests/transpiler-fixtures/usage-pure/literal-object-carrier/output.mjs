import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A local object slot only carries the literal. Read-only navigation keeps its field types.
const box = {
  data: [1, 2]
};
const wrap = {
  inner: box
};
wrap.inner.data.length;
export const at = _atMaybeArray(box.data);