import "core-js/modules/es.array.at";
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
export const {
  at
} = box.data;