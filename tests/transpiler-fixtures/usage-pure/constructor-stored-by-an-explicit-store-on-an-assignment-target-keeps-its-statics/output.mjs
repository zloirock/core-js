import _Map from "@core-js/pure/actual/map";
import _Object$assign from "@core-js/pure/actual/object/assign";
// an explicit store into an assignment writes the chain its value lands on, as a member write through it does,
// so a static read back through the container is no longer the literal's to fold
const box = {
  inner: {
    C: Object
  }
};
let held;
_Object$assign(held = box.inner, {
  C: _Map
});
export const grouped = box.inner.C.groupBy([1], x => x);