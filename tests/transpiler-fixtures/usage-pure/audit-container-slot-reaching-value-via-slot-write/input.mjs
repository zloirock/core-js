// Written slots contribute their reaching constructors to global static injection.
// Local aliases and wrappers do not release the whole constructor family.
// Pure keeps written slots native with their statics; a proven replacement drops the old guard.
const cw = { k: Object };
cw.k = Map;
const { k: { groupBy: viaSlotWrite } } = cw;
export { viaSlotWrite };
