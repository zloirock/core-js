import _Iterator from "@core-js/pure/actual/iterator";
// a constructor written through a binding a pattern takes off a selection of containers lands on the slot it
// takes in whichever container the selection holds, so a static read back through the path of one reaches
// the written constructor's static
const first = {
  inner: {
    C: Array
  }
};
const second = {
  inner: {
    C: Object
  }
};
const either = flag ? first : second;
const {
  inner: hole
} = either;
hole.C = _Iterator;
export const copied = first.inner.C.from([1]);