// a destructure whose init is MEMOIZED keeps extracting statics for the props AFTER the memo. this
// emitter mutates the host in place, so the memo replaces the init and later props resolve against a
// bare ref; without the constructor's name riding along, the first instance prop ended extraction and
// the remaining statics shipped as native reads off that ref.
// the memo also has to PRECEDE what the group already emitted: natively the init runs before the
// pattern binds anything, so a static extracted ahead of the memoizing prop may not be hoisted above
// the init's effects - an effect reading that binding sees TDZ in the source. two ways it slipped:
// the memo was planted at the host, landing after the extraction, and a group whose props had been
// spliced out read as a sole-prop one, which inlines the init into the surviving prop instead.
const eff = () => {};
function arrayCtor() {
  return Array;
}
export const { name, of } = arrayCtor();
export const { of: seqOf, name: seqName, from: seqFrom } = (eff(), Array);
export const { name: n2, length: l2, of: o2 } = (eff(), Array);

// NEGATIVE: an un-memoized bare constructor never lost them
export const { name: bareName, of: bareOf } = Array;
// NEGATIVE: a proxy-global member receiver already registered its constructor
export const { name: navName, of: navOf } = globalThis.Array;
