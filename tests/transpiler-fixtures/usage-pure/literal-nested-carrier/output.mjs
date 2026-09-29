import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Nested literal slots and a carrier alias preserve the held object until a use exposes it.
const box = {
  data: [1, 2]
};
const wrap = {
  outer: {
    inner: box
  }
};
const alias = wrap;
alias.outer.inner.data.length;
export const at = _atMaybeArray(box.data);