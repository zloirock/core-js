import _Map from "@core-js/pure/actual/map";
// a constructor written through a selection one arm of which is a binding a pattern takes off a container
// lands on the slot that binding takes, so a static read back through the container's path reaches the
// written constructor's static
const holder = {
  inner: {
    C: Object
  }
};
const spare = {
  C: Object
};
const {
  inner: held
} = holder;
const picked = flag ? held : spare;
picked.C = _Map;
export const grouped = holder.inner.C.groupBy([1], x => x);