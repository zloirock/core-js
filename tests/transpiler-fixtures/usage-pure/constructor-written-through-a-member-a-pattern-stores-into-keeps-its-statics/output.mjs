import _Map from "@core-js/pure/actual/map";
// a container a pattern stores into a member is handed to that member as a flat `=` hands it, whatever holds
// the member, so a static read back through the container's own path is no longer the literal's to fold
const box = {
  inner: {
    C: Object
  }
};
const holder = make();
({
  inner: holder.v
} = box);
holder.v.C = _Map;
export const grouped = box.inner.C.groupBy([1], x => x);