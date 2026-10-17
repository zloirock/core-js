import _Map from "@core-js/pure/actual/map";
// Written slots contribute their reaching constructors to global static injection.
// Local aliases and wrappers do not release the whole constructor family.
// Pure keeps written slots native with their statics; a proven replacement drops the old guard.
const cw = {
  k: Object
};
cw.k = _Map;
const {
  k: {
    groupBy: viaSlotWrite
  }
} = cw;
export { viaSlotWrite };