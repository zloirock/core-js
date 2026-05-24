// outer arrow body-wrap absorbing TWO scopedVar inserts from two sibling inner blocks.
// pins the multi-scopedVar branch of #composeBodyWrapText: scopedVars sorted descending by
// start so each splice's local offset stays valid through the loop. without sort, the
// second splice's localStart references a shifted position after the first splice extended
// the slice
const { from } = ((() => (
  ((() => { var z1 = [1].at(0); return z1; })(), [2].at(0))
    + ((() => { var z2 = [3].at(0); return z2; })(), [4].at(0))
))(), Array);
console.log(from);
