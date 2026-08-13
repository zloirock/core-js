// export x receiver-memo x LIVE instance default: the memo hoist plants BEFORE the `export`
// keyword, so the destructure keeps its export (every user binding stays on the module surface)
// and the internal ref temp does not join it. both memo flavours - a constant-literal receiver
// and a member receiver; the non-export twin locks the plain insert position (control)
export const { [(e(), 'with')]: w = dflt(), [(e2(), 'toSpliced')]: t } = [9];
export const { [(e3(), 'flat')]: m = dflt(), other } = holder.p;
const { [(e4(), 'at')]: a = dflt() } = [7];
console.log(w, t, m, other, a);
// TWO memoized constant-literal receivers in ONE exported multi-declarator: each declarator's
// memo takes its sibling-channel slot while every user binding stays exported
export const { [(e5(), 'toReversed')]: r1 = dflt(), other2 } = [3], { [(e6(), 'toSorted')]: s1 = dflt() } = [4];
console.log(r1, s1, other2);
