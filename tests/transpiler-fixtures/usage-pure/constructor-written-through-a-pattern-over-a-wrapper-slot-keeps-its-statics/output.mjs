import _Map from "@core-js/pure/actual/map";
// a binding a pattern takes off a wrapper's slot that holds a container by name is that container, so a
// constructor written through it keeps its statics for a static read back through the container's own name
const box = {
  C: Object
};
const wrapper = {
  x: box
};
const {
  x: viaWrapper
} = wrapper;
viaWrapper.C = _Map;
export const grouped = box.C.groupBy([1], x => x);