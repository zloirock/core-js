import _Iterator from "@core-js/pure/actual/iterator";
const iterated = {
  inner: {
    C: _Iterator
  }
};
const same = iterated;
const member = same.inner;
member.C = userValue;
export const wrapped = iterated.inner.C.from([1]);