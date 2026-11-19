// a LOGICAL retest spells each leg through the same nested canon - the left leg keeps its own
// guarded read, the right leg guards the dispatch
const lg = () => globalThis;
export const viaLogicalRetest = lg()?.window?.self && lg()?.window?.self?.Array.of(30).at(0);
