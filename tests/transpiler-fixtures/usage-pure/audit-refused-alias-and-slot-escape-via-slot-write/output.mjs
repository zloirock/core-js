import _Map from "@core-js/pure/actual/map";
// a bare ctor ESCAPING into a container slot resolves to the NAMESPACE entry (statics
// included): the slot's readers bail by design, so the stored value must carry them itself.
// the logical-assignment spellings store the reference the same way
const w = {
  k: Object
};
w.k = _Map;
export const viaSlotWrite = typeof w.k.groupBy;