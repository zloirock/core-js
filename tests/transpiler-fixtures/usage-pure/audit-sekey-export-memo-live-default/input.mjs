// Exported computed-key instance patterns retain every user binding and keep generated
// receiver captures private. Receiver reads, key effects and live defaults run in source
// order across literal and member receivers, including multiple declarators.
// The non-exported case follows the same ordering.
export const { [(e(), 'with')]: w = dflt(), [(e2(), 'toSpliced')]: t } = [9];
export const { [(e3(), 'flat')]: m = dflt(), other } = holder.p;
const { [(e4(), 'at')]: a = dflt() } = [7];
console.log(w, t, m, other, a);
// Two receiver captures in one exported declaration stay distinct; only user bindings are exported.
export const { [(e5(), 'toReversed')]: r1 = dflt(), other2 } = [3], { [(e6(), 'toSorted')]: s1 = dflt() } = [4];
console.log(r1, s1, other2);
